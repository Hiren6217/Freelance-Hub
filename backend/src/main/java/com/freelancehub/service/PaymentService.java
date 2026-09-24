package com.freelancehub.service;

import com.freelancehub.model.Contract;
import com.freelancehub.model.Message;
import com.freelancehub.model.Notification;
import com.freelancehub.model.Payment;
import com.freelancehub.model.TimeLog;
import com.freelancehub.repository.MessageRepository;
import com.freelancehub.repository.NotificationRepository;
import com.freelancehub.repository.PaymentRepository;
import com.freelancehub.repository.TimeLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Owns platform payments: creating what the client owes when work is delivered,
 * driving the PayPal order/capture flow, and crediting the developer once paid.
 *
 * A payment is created DUE the moment work is completed (due immediately):
 *   - PROJECT contract COMPLETED -> one payment for the whole fee.
 *   - HOURLY contract, per logged hour -> one payment for hours * hourly rate.
 *
 * Fee math mirrors {@link ContractService}: the client pays the gross amount, the
 * platform keeps 5%, and the developer is credited 95%. The rate is read from
 * {@link ContractService#PLATFORM_FEE_RATE} statically so the two services don't
 * depend on each other (ContractService injects PaymentService, not vice-versa).
 */
@Service
public class PaymentService {

    public static final String TYPE_PROJECT = "PROJECT";
    public static final String TYPE_HOURLY = "HOURLY";

    public static final String STATUS_DUE = "DUE";
    public static final String STATUS_PROCESSING = "PROCESSING";
    public static final String STATUS_PAID = "PAID";
    public static final String STATUS_FAILED = "FAILED";

    /** Statuses that keep a client on the hook (and thus at risk of suspension). */
    public static final List<String> UNPAID_STATUSES = Arrays.asList(STATUS_DUE, STATUS_PROCESSING);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private PayPalService payPalService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MessageRepository messageRepository;

    /** Gross fee for the whole project = the agreed contract amount. */
    public Payment createDueForProject(Contract contract) {
        BigDecimal gross = contract.getAmount().setScale(2, RoundingMode.HALF_UP);
        Payment payment = buildDue(contract, TYPE_PROJECT, gross);
        payment.setTimeLogId(null);
        Payment saved = paymentRepository.save(payment);
        notifyClientOfDue(saved, "Project \"" + safeTitle(contract) + "\" is complete");
        return saved;
    }

    /** Gross fee for one logged time entry = hours * hourly rate (contract amount). */
    public Payment createDueForHour(Contract contract, TimeLog timeLog) {
        BigDecimal hours = timeLog.getHours() == null ? BigDecimal.ONE : timeLog.getHours();
        BigDecimal gross = contract.getAmount().multiply(hours).setScale(2, RoundingMode.HALF_UP);
        Payment payment = buildDue(contract, TYPE_HOURLY, gross);
        payment.setTimeLogId(timeLog.getId());
        Payment saved = paymentRepository.save(payment);
        notifyClientOfDue(saved,
            hours.stripTrailingZeros().toPlainString() + "h logged on \"" + safeTitle(contract) + "\"");
        return saved;
    }

    /**
     * Records worked hours against an HOURLY contract and creates the client's DUE
     * payment for them, linking the two. Returns the persisted {@link TimeLog}
     * (with its {@code paymentId} set).
     */
    public TimeLog logHour(Contract contract, BigDecimal hours, String description, LocalDate workedOn) {
        TimeLog timeLog = new TimeLog();
        timeLog.setContractId(contract.getId());
        timeLog.setDeveloperId(contract.getDeveloperId());
        timeLog.setClientId(contract.getClientId());
        timeLog.setHours(hours == null || hours.compareTo(BigDecimal.ZERO) <= 0 ? BigDecimal.ONE : hours);
        timeLog.setDescription(description);
        timeLog.setWorkedOn(workedOn);
        TimeLog savedLog = timeLogRepository.save(timeLog);

        Payment payment = createDueForHour(contract, savedLog);
        savedLog.setPaymentId(payment.getId());
        return timeLogRepository.save(savedLog);
    }

    public List<TimeLog> getContractTimeLogs(Long contractId) {
        return timeLogRepository.findByContractIdOrderByCreatedAtDesc(contractId);
    }

    private Payment buildDue(Contract contract, String type, BigDecimal gross) {
        BigDecimal platformFee = computePlatformFee(gross);
        BigDecimal developerEarnings = gross.subtract(platformFee).setScale(2, RoundingMode.HALF_UP);

        Payment payment = new Payment();
        payment.setContractId(contract.getId());
        payment.setClientId(contract.getClientId());
        payment.setDeveloperId(contract.getDeveloperId());
        payment.setType(type);
        payment.setAmount(gross);
        payment.setPlatformFee(platformFee);
        payment.setDeveloperEarnings(developerEarnings);
        payment.setCurrency(contract.getCurrency() == null ? "USD" : contract.getCurrency());
        payment.setStatus(STATUS_DUE);
        payment.setProvider("PAYPAL");
        // dueAt defaults to createdAt (due immediately) via @PrePersist.
        return payment;
    }

    /** 5% of the gross, rounded to cents. Static to avoid a circular service dependency. */
    public static BigDecimal computePlatformFee(BigDecimal gross) {
        return gross.multiply(ContractService.PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Starts a PayPal order for a DUE payment and records the order id, moving it to
     * PROCESSING. Throws {@link PayPalService.PayPalNotConfiguredException} (-> 503)
     * when credentials are absent.
     */
    public Payment initiateOrder(Long paymentId) {
        Payment payment = getOrThrow(paymentId);
        if (STATUS_PAID.equals(payment.getStatus())) {
            throw new IllegalStateException("Payment #" + paymentId + " is already paid");
        }
        String orderId = payPalService.createOrder(
            payment.getAmount(),
            payment.getCurrency(),
            "PAYMENT-" + payment.getId(),
            "FreelanceHub " + payment.getType().toLowerCase() + " payment #" + payment.getId());

        payment.setProviderOrderId(orderId);
        payment.setStatus(STATUS_PROCESSING);
        return paymentRepository.save(payment);
    }

    /**
     * Captures an approved PayPal order for a payment. On COMPLETED, marks the payment
     * PAID, records the capture id and paidAt, and credits the developer (notification).
     * On anything else, resets the payment to DUE so it stays enforceable.
     *
     * @return the updated payment.
     */
    public Payment confirmCapture(Long paymentId, String orderId) {
        Payment payment = getOrThrow(paymentId);
        if (STATUS_PAID.equals(payment.getStatus())) {
            return payment; // idempotent: already captured.
        }
        String effectiveOrderId = orderId != null ? orderId : payment.getProviderOrderId();
        if (effectiveOrderId == null) {
            throw new IllegalStateException("No PayPal order to capture for payment #" + paymentId);
        }

        PayPalService.CaptureResult result = payPalService.captureOrder(effectiveOrderId);
        payment.setProviderOrderId(effectiveOrderId);

        if (result.isCompleted()) {
            payment.setStatus(STATUS_PAID);
            payment.setProviderCaptureId(result.captureId());
            payment.setPaidAt(LocalDateTime.now());
            Payment saved = paymentRepository.save(payment);
            notifyDeveloperOfCredit(saved);
            return saved;
        }

        // Not completed -> keep it collectible.
        payment.setStatus(STATUS_DUE);
        return paymentRepository.save(payment);
    }

    public List<Payment> getClientPayments(Long clientId) {
        return paymentRepository.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    public List<Payment> getDeveloperPayments(Long developerId) {
        return paymentRepository.findByDeveloperIdOrderByCreatedAtDesc(developerId);
    }

    public List<Payment> getContractPayments(Long contractId) {
        return paymentRepository.findByContractIdOrderByCreatedAtDesc(contractId);
    }

    /** Whether the client still has any unpaid (DUE/PROCESSING) platform payment. */
    public boolean hasOutstanding(Long clientId) {
        return paymentRepository.existsByClientIdAndStatusIn(clientId, UNPAID_STATUSES);
    }

    private Payment getOrThrow(Long paymentId) {
        return paymentRepository.findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment #" + paymentId + " not found"));
    }

    private void notifyClientOfDue(Payment payment, String context) {
        String amount = payment.getCurrency() + " " + payment.getAmount().toPlainString();
        Notification notification = new Notification();
        notification.setUserId(payment.getClientId());
        notification.setType("PAYMENT_DUE");
        notification.setTitle("Payment due: " + amount);
        notification.setBody(context + ". Release " + amount
            + " through the platform now to avoid your account being suspended.");
        notificationRepository.save(notification);

        Message message = new Message();
        message.setSenderId(payment.getDeveloperId());
        message.setReceiverId(payment.getClientId());
        message.setContent(context + ". Please release the platform payment of " + amount
            + " (payment #" + payment.getId() + ").");
        messageRepository.save(message);
    }

    private void notifyDeveloperOfCredit(Payment payment) {
        String earnings = payment.getCurrency() + " " + payment.getDeveloperEarnings().toPlainString();
        Notification notification = new Notification();
        notification.setUserId(payment.getDeveloperId());
        notification.setType("PAYMENT_RECEIVED");
        notification.setTitle("You've been credited " + earnings);
        notification.setBody("The client released payment #" + payment.getId() + ". "
            + "Your earnings (" + earnings + ", after the 5% platform fee) have been credited.");
        notificationRepository.save(notification);
    }

    private static String safeTitle(Contract contract) {
        String title = contract.getTitle();
        return (title == null || title.isBlank()) ? ("contract #" + contract.getId()) : title;
    }
}
