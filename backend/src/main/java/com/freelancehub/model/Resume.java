package com.freelancehub.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.databind.JsonNode;

@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "parsed_data", columnDefinition = "JSON")
    private String parsedData; // Using String for JSON, or use JsonNode if configured

    @Column(name = "uploaded_at")
    private java.sql.Timestamp uploadedAt;

    // Constructors
    public Resume() {}

    public Resume(User user, String fileName, String filePath, String parsedData) {
        this.user = user;
        this.fileName = fileName;
        this.filePath = filePath;
        this.parsedData = parsedData;
        this.uploadedAt = new java.sql.Timestamp(System.currentTimeMillis());
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getParsedData() { return parsedData; }
    public void setParsedData(String parsedData) { this.parsedData = parsedData; }

    public java.sql.Timestamp getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(java.sql.Timestamp uploadedAt) { this.uploadedAt = uploadedAt; }
}