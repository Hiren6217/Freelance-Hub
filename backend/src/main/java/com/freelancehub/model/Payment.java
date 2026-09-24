package com.freelancehub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A payment the client must release to the platform for work delivered on a
 * contract. Created as DUE the moment work is completed:
 *   - PROJECT contracts -> one payment for the whole fee when marked COMPLETED.
 *   - HOURLY contracts  -> one payment per logged hour (see TimeLog).
 *
 * The client pays the gross {@code amount} via PayPal; the platform keeps the
 * 5% {@code platformFee} and credits the developer {@code developerEarnings}.
 * While any payment stays DUE past its {@code dueAt}, the client is suspended.
 */
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "developer_id", nullable = false)
    private Long developerId;

    // PROJECT or HOURLY
    @Column(nullable = false, length = 20)
    private String type;

    // For HOURLY payments, the TimeLog this payment settles (nullable for PROJECT).
    @Column(name = "time_log_id")
    private Long timeLogId;

    // Gross amount the client pays.
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "platform_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal platformFee;

    @Column(name = "developer_earnings", nullable = false, precision = 12, scale = 2)
    private BigDecimal developerEarnings;

    @Column(nullable = false, length = 8)
    private String currency = "USD";

    // DUE, PROCESSING, PAID, FAILED
    @Column(nullable = false, length = 20)
    private String status = "DUE";

    @Column(nullable = false, length = 20)
    private String provider = "PAYPAL";

    @Column(name = "provider_order_id", length = 100)
    private String providerOrderId;

    @Column(name = "provider_capture_id", length = 100)
    private String providerCaptureId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // When payment becomes overdue. Equal to createdAt (due immediately).
    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dueAt == null) {
            dueAt = createdAt;
        }
    }
}
