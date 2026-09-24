package com.freelancehub.service;

import com.freelancehub.model.Payment;
import com.freelancehub.model.User;
import com.freelancehub.repository.PaymentRepository;
import com.freelancehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Enforces the "pay through the platform or lose access" rule.
 *
 * Every minute it:
 *   (a) SUSPENDS any client who has a payment still DUE past its dueAt, and
 *   (b) REACTIVATES any suspended client whose dues have all been cleared.
 *
 * Suspension is reversible purely by paying: the client can still reach the open
 * payment endpoints while suspended, and the next tick flips them back to ACTIVE.
 * Because the app has no per-request auth, suspension takes effect at login/OTP
 * (see AuthController) rather than force-killing an open session.
 */
@Service
public class PaymentEnforcementService {

    public static final String ACCOUNT_ACTIVE = "ACTIVE";
    public static final String ACCOUNT_SUSPENDED = "SUSPENDED";

    private static final String ROLE_CLIENT = "CLIENT";

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    /** Runs shortly after startup and then once a minute. */
    @Scheduled(fixedRate = 60_000, initialDelay = 15_000)
    public void enforce() {
        try {
            suspendDelinquentClients();
            reactivateClearedClients();
        } catch (Exception e) {
            // Never let a scheduling tick crash the scheduler thread.
            System.err.println("Payment enforcement tick failed: " + e.getMessage());
        }
    }

    /** Suspend clients who still have an overdue DUE payment. */
    private void suspendDelinquentClients() {
        List<Payment> overdue = paymentRepository.findByStatusInAndDueAtBefore(
            List.of(PaymentService.STATUS_DUE), LocalDateTime.now());

        Set<Long> clientIds = new LinkedHashSet<>();
        for (Payment payment : overdue) {
            clientIds.add(payment.getClientId());
        }

        for (Long clientId : clientIds) {
            userRepository.findById(clientId).ifPresent(user -> {
                if (isSuspendableClient(user)) {
                    user.setAccountStatus(ACCOUNT_SUSPENDED);
                    user.setSuspendedAt(LocalDateTime.now());
                    user.setSuspendReason("Outstanding platform payment(s) not released.");
                    userRepository.save(user);
                }
            });
        }
    }

    /** Reactivate suspended clients once they have no unpaid (DUE/PROCESSING) payments. */
    private void reactivateClearedClients() {
        List<User> suspended = userRepository.findByAccountStatus(ACCOUNT_SUSPENDED);
        for (User user : suspended) {
            boolean stillOwes = paymentRepository.existsByClientIdAndStatusIn(
                user.getId(), PaymentService.UNPAID_STATUSES);
            if (!stillOwes) {
                user.setAccountStatus(ACCOUNT_ACTIVE);
                user.setSuspendedAt(null);
                user.setSuspendReason(null);
                userRepository.save(user);
            }
        }
    }

    private static boolean isSuspendableClient(User user) {
        // Suspend any client that isn't already suspended. Treat null/blank status
        // (legacy rows created before the account_status column existed) as active.
        return !ACCOUNT_SUSPENDED.equalsIgnoreCase(user.getAccountStatus())
            && (user.getRole() == null || ROLE_CLIENT.equalsIgnoreCase(user.getRole()));
    }
}
