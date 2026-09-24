package com.freelancehub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * An hour (or hours) of work a developer logs against an HOURLY contract.
 * Each logged entry generates a DUE {@link Payment} the client must release.
 */
@Entity
@Table(name = "time_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "developer_id", nullable = false)
    private Long developerId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    // Hours worked for this entry (defaults to 1).
    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal hours = BigDecimal.ONE;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "worked_on")
    private LocalDate workedOn;

    // The Payment generated for this logged time.
    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (workedOn == null) {
            workedOn = LocalDate.now();
        }
        if (hours == null) {
            hours = BigDecimal.ONE;
        }
    }
}
