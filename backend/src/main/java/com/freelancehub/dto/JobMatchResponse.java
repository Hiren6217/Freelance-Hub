package com.freelancehub.dto;

import com.freelancehub.model.Job;

import java.util.List;

public class JobMatchResponse {
    private Long jobId;
    private String title;
    private String company;
    private String location;
    private double matchScore;
    private List<String> matchedSkills;

    public JobMatchResponse(Job job, double matchScore, List<String> matchedSkills) {
        this.jobId = job.getId();
        this.title = job.getTitle();
        this.company = job.getCompany();
        this.location = job.getLocation();
        this.matchScore = matchScore;
        this.matchedSkills = matchedSkills;
    }

    // Getters and Setters
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }
}