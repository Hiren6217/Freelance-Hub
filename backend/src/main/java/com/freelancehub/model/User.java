package com.freelancehub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 120)
    private String name;
    
    @Column(nullable = false, unique = true, length = 160)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, length = 30)
    private String role = "FREELANCER";
    
    @Column(name = "referral_score")
    private Integer referralScore = 0;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
