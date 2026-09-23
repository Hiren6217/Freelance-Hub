package com.freelancehub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A Google Meet interview a client schedules with a developer for a job
 * application, before the final contract is offered.
 *
 * The meeting link is supplied by the client (created in their own Google
 * account); the platform stores it and notifies the developer so they can join.
 */
@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id")
    private Long jobId;

    // The JobApplication this interview relates to (optional).
    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "developer_id", nullable = false)
    private Long developerId;

    @Column(length = 255)
    private String title;

    // Google Meet (or other) join link supplied by the client.
    @Column(name = "meeting_link", nullable = false, length = 512)
    private String meetingLink;

    // Agreed date/time of the interview.
    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(columnDefinition = "TEXT")
    private String note;

    // SCHEDULED, CANCELLED, COMPLETED
    @Column(nullable = false, length = 20)
    private String status = "SCHEDULED";

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
