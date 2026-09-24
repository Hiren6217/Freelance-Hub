package com.freelancehub.service;

import com.freelancehub.model.Contract;
import com.freelancehub.model.Message;
import com.freelancehub.model.Notification;
import com.freelancehub.repository.ContractRepository;
import com.freelancehub.repository.MessageRepository;
import com.freelancehub.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;

/**
 * Owns the platform fee logic and the contract lifecycle.
 *
 * The platform takes a flat 5% fee that is deducted from the developer's payout.
 * The fee is computed against the agreed amount for the contract's billing unit
 * (per hour, per month, or the whole project fee), so the client still pays the
 * agreed amount and the developer receives 95% of it.
 */
@Service
public class ContractService {

    /** Flat platform fee: 5% cut from the developer's earnings. */
    public static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.05");

    public static final String BILLING_HOURLY = "HOURLY";
    public static final String BILLING_MONTHLY = "MONTHLY";
    public static final String BILLING_PROJECT = "PROJECT";
    private static final List<String> BILLING_TYPES = Arrays.asList(BILLING_HOURLY, BILLING_MONTHLY, BILLING_PROJECT);

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    private static final List<String> STATUSES =
        Arrays.asList(STATUS_PENDING, STATUS_ACTIVE, STATUS_COMPLETED, STATUS_CANCELLED);

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PaymentService paymentService;

    public static boolean isValidBillingType(String billingType) {
        return billingType != null && BILLING_TYPES.contains(billingType.toUpperCase());
    }

    public static boolean isValidStatus(String status) {
        return status != null && STATUSES.contains(status.toUpperCase());
    }

    /**
     * Applies the 5% platform fee to a contract in place. The agreed {@code amount}
     * is interpreted per the billing unit (hourly rate, monthly rate, or fixed
     * project fee); the fee and the developer's net earnings are derived from it.
     */
    public void applyPlatformFee(Contract contract) {
        BigDecimal amount = contract.getAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal platformFee = amount.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal developerEarnings = amount.subtract(platformFee).setScale(2, RoundingMode.HALF_UP);

        contract.setAmount(amount);
        contract.setPlatformFeeRate(PLATFORM_FEE_RATE.setScale(4, RoundingMode.HALF_UP));
        contract.setPlatformFee(platformFee);
        contract.setDeveloperEarnings(developerEarnings);
    }

    /**
     * Creates and persists a new contract, computing the platform fee. The contract
     * starts as PENDING until the developer accepts it (which finalizes it).
     */
    public Contract createContract(Contract contract) {
        contract.setBillingType(contract.getBillingType().toUpperCase());
        if (contract.getCurrency() == null || contract.getCurrency().isBlank()) {
            contract.setCurrency("USD");
        }
        contract.setStatus(STATUS_PENDING);
        applyPlatformFee(contract);

        Contract saved = contractRepository.save(contract);
        notifyDeveloperOfNewContract(saved);
        return saved;
    }

    /**
     * Transitions a contract to a new status and notifies the counterparty.
     * Moving to ACTIVE represents the developer accepting the final contract.
     */
    public Contract updateStatus(Contract contract, String newStatus) {
        String normalized = newStatus.toUpperCase();
        String previous = contract.getStatus();
        contract.setStatus(normalized);
        Contract saved = contractRepository.save(contract);

        if (!normalized.equals(previous)) {
            notifyStatusChange(saved, normalized);

            // A completed PROJECT contract makes the whole fee payable by the client.
            // (HOURLY contracts create dues per logged hour instead — see TimeLogController.)
            if (STATUS_COMPLETED.equals(normalized) && BILLING_PROJECT.equalsIgnoreCase(saved.getBillingType())) {
                paymentService.createDueForProject(saved);
            }
        }
        return saved;
    }

    private void notifyDeveloperOfNewContract(Contract contract) {
        String feeSummary = feeSummary(contract);

        Notification notification = new Notification();
        notification.setUserId(contract.getDeveloperId());
        notification.setType("CONTRACT_PROPOSED");
        notification.setTitle("New contract to review");
        notification.setBody("The client sent you contract #" + contract.getId() + ". " + feeSummary
            + " Review and accept it to finalize the agreement.");
        notificationRepository.save(notification);

        Message message = new Message();
        message.setSenderId(contract.getClientId());
        message.setReceiverId(contract.getDeveloperId());
        message.setContent("I've prepared the final contract (#" + contract.getId() + ") for our project. "
            + feeSummary + " Please review and accept it on your dashboard.");
        messageRepository.save(message);
    }

    private void notifyStatusChange(Contract contract, String status) {
        // On acceptance, notify the client; otherwise notify the developer.
        boolean notifyClient = STATUS_ACTIVE.equals(status);
        Long recipientId = notifyClient ? contract.getClientId() : contract.getDeveloperId();
        Long senderId = notifyClient ? contract.getDeveloperId() : contract.getClientId();

        Notification notification = new Notification();
        notification.setUserId(recipientId);
        notification.setType("CONTRACT_" + status);
        notification.setTitle(statusTitle(status));
        notification.setBody(statusBody(contract, status));
        notificationRepository.save(notification);

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(recipientId);
        message.setContent(statusBody(contract, status));
        messageRepository.save(message);
    }

    private String statusTitle(String status) {
        switch (status) {
            case STATUS_ACTIVE:
                return "Contract finalized";
            case STATUS_COMPLETED:
                return "Contract completed";
            case STATUS_CANCELLED:
                return "Contract cancelled";
            default:
                return "Contract updated";
        }
    }

    private String statusBody(Contract contract, String status) {
        switch (status) {
            case STATUS_ACTIVE:
                return "Contract #" + contract.getId() + " has been accepted and finalized. " + feeSummary(contract);
            case STATUS_COMPLETED:
                return "Contract #" + contract.getId() + " has been marked as completed.";
            case STATUS_CANCELLED:
                return "Contract #" + contract.getId() + " has been cancelled.";
            default:
                return "Contract #" + contract.getId() + " status changed to " + status + ".";
        }
    }

    /** Human-readable one-liner describing the amount, the 5% cut, and the net payout. */
    private String feeSummary(Contract contract) {
        String unit;
        switch (contract.getBillingType()) {
            case BILLING_HOURLY:
                unit = "/hour";
                break;
            case BILLING_MONTHLY:
                unit = "/month";
                break;
            default:
                unit = " total";
                break;
        }
        String cur = contract.getCurrency();
        return "Agreed " + cur + " " + contract.getAmount() + unit
            + "; platform fee (5%) " + cur + " " + contract.getPlatformFee() + unit
            + "; you receive " + cur + " " + contract.getDeveloperEarnings() + unit + ".";
    }
}
