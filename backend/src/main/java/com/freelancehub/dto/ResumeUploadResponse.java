package com.freelancehub.dto;

import java.util.List;

public class ResumeUploadResponse {
    private Long resumeId;
    private String message;
    private ParsedData parsedData;

    public ResumeUploadResponse(Long resumeId, String message, ParsedData parsedData) {
        this.resumeId = resumeId;
        this.message = message;
        this.parsedData = parsedData;
    }

    // Getters and Setters
    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public ParsedData getParsedData() { return parsedData; }
    public void setParsedData(ParsedData parsedData) { this.parsedData = parsedData; }

    public static class ParsedData {
        private List<String> skills;
        private String experience;
        private String education;
        private List<String> keywords;

        public ParsedData(List<String> skills, String experience, String education, List<String> keywords) {
            this.skills = skills;
            this.experience = experience;
            this.education = education;
            this.keywords = keywords;
        }

        // Getters and Setters
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }

        public String getExperience() { return experience; }
        public void setExperience(String experience) { this.experience = experience; }

        public String getEducation() { return education; }
        public void setEducation(String education) { this.education = education; }

        public List<String> getKeywords() { return keywords; }
        public void setKeywords(List<String> keywords) { this.keywords = keywords; }
    }
}