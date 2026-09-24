package com.freelancehub.repository;

import com.freelancehub.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<Payment> findByDeveloperIdOrderByCreatedAtDesc(Long developerId);

    List<Payment> findByContractIdOrderByCreatedAtDesc(Long contractId);

    // Clients with at least one overdue, unpaid payment -> should be suspended.
    List<Payment> findByClientIdAndStatusInAndDueAtBefore(
        Long clientId, Collection<String> statuses, LocalDateTime cutoff);

    boolean existsByClientIdAndStatusInAndDueAtBefore(
        Long clientId, Collection<String> statuses, LocalDateTime cutoff);

    // Distinct client ids that currently have an overdue, unpaid payment.
    List<Payment> findByStatusInAndDueAtBefore(Collection<String> statuses, LocalDateTime cutoff);

    boolean existsByClientIdAndStatusIn(Long clientId, Collection<String> statuses);
}
