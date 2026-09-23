package com.freelancehub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Final contract agreed between a client and a developer for a job.
 *
 * The platform charges a 5% fee that is deducted from the developer's payout
 * (the developer nets 95%). The fee is computed against the agreed amount for
 * the chosen billing unit:
 *   - HOURLY  -> amount is the hourly rate; fee is 5% per hour
 *   - MONTHLY -> amount is the monthly rate; fee is 5% per month
 *   - PROJECT -> amount is the fixed project fee; fee is 5% of the total
 *
 * platformFee and developerEarnings are computed and stored by ContractService.
 */
@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    // The accepted JobApplication this contract was created from (optional).
    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "developer_id", nullable = false)
    private Long developerId;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // HOURLY, MONTHLY, or PROJECT
    @Column(name = "billing_type", nullable = false, length = 20)
    private String billingType;

    @Column(nullable = false, length = 8)
    private String currency = "USD";

    // Agreed amount for the billing unit (hourly rate, monthly rate, or fixed project fee).
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    // Fee rate applied at finalization, stored for auditability (e.g. 0.0500 = 5%).
    @Column(name = "platform_fee_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal platformFeeRate;

    // 5% platform fee cut from the amount (per billing unit).
    @Column(name = "platform_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal platformFee;

    // What the developer actually receives after the fee (amount - platformFee).
    @Column(name = "developer_earnings", nullable = false, precision = 12, scale = 2)
    private BigDecimal developerEarnings;

    // PENDING (proposed by client), ACTIVE (accepted/finalized), COMPLETED, CANCELLED
    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
