package com.freelancehub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "recruiter_id", nullable = false)
    private Long recruiterId;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(nullable = false, length = 255)
    private String company;
    
    @Column(length = 255)
    private String location;
    
    @Column(name = "job_type", length = 60)
    private String jobType;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String skills;
    
    @Column(name = "referral_bonus", length = 80)
    private String referralBonus;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
