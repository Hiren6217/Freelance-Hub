package com.freelancehub.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "job_id", nullable = false)
    private Long jobId;
    
    @Column(name = "applicant_id", nullable = false)
    private Long applicantId;
    
    @Column(name = "recruiter_id", nullable = false)
    private Long recruiterId;
    
    @Column(columnDefinition = "TEXT")
    private String coverLetter;
    
    @Column(length = 30)
    private String status = "PENDING"; // PENDING, REVIEWED, ACCEPTED, REJECTED
    
    @Column(name = "applied_at")
    private LocalDateTime appliedAt;
    
    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
    }
}
