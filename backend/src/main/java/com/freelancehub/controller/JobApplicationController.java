package com.freelancehub.controller;

import com.freelancehub.model.JobApplication;
import com.freelancehub.model.Message;
import com.freelancehub.model.Notification;
import com.freelancehub.repository.JobApplicationRepository;
import com.freelancehub.repository.JobRepository;
import com.freelancehub.repository.MessageRepository;
import com.freelancehub.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MessageRepository messageRepository;

    // Apply for a job
    @PostMapping
    public ResponseEntity<?> applyForJob(@RequestBody Map<String, Object> requestData) {
        Map<String, String> response = new HashMap<>();
        
        try {
            Long jobId = Long.valueOf(requestData.get("jobId").toString());
            Long applicantId = Long.valueOf(requestData.get("applicantId").toString());
            Long recruiterId = Long.valueOf(requestData.get("recruiterId").toString());
            String coverLetter = requestData.get("coverLetter") != null ? 
                requestData.get("coverLetter").toString() : "";

            // Check if job exists
            if (!jobRepository.existsById(jobId)) {
                response.put("error", "Job not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Check if already applied
            if (applicationRepository.existsByJobIdAndApplicantId(jobId, applicantId)) {
                response.put("error", "You have already applied to this job");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Create application
            JobApplication application = new JobApplication();
            application.setJobId(jobId);
            application.setApplicantId(applicantId);
            application.setRecruiterId(recruiterId);
            application.setCoverLetter(coverLetter);
            application.setStatus("PENDING");

            JobApplication savedApplication = applicationRepository.save(application);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedApplication);
        } catch (Exception e) {
            response.put("error", "Failed to submit application: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get all applications for a specific job (for recruiters)
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicationsByJob(@PathVariable Long jobId) {
        List<JobApplication> applications = applicationRepository.findByJobId(jobId);
        return ResponseEntity.ok(applications);
    }

    // Get all applications by a specific applicant (for developers)
    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<?> getApplicationsByApplicant(@PathVariable Long applicantId) {
        List<JobApplication> applications = applicationRepository.findByApplicantId(applicantId);
        return ResponseEntity.ok(applications);
    }

    // Get all applications for a recruiter's jobs
    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<?> getApplicationsByRecruiter(@PathVariable Long recruiterId) {
        List<JobApplication> applications = applicationRepository.findByRecruiterId(recruiterId);
        return ResponseEntity.ok(applications);
    }

    // Update application status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestData) {
        Map<String, String> response = new HashMap<>();
        
        try {
            String newStatus = requestData.get("status");
            
            if (newStatus == null || (!newStatus.equals("PENDING") && 
                !newStatus.equals("REVIEWED") && 
                !newStatus.equals("ACCEPTED") && 
                !newStatus.equals("REJECTED"))) {
                response.put("error", "Invalid status. Must be: PENDING, REVIEWED, ACCEPTED, or REJECTED");
                return ResponseEntity.badRequest().body(response);
            }

            JobApplication application = applicationRepository.findById(id).orElse(null);
            if (application == null) {
                response.put("error", "Application not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            String previousStatus = application.getStatus();
            application.setStatus(newStatus);
            JobApplication updatedApplication = applicationRepository.save(application);

            createStatusNotification(updatedApplication, previousStatus, newStatus);
            createStatusMessage(updatedApplication, previousStatus, newStatus);
            
            return ResponseEntity.ok(updatedApplication);
        } catch (Exception e) {
            response.put("error", "Failed to update status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Delete application
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        
        try {
            if (!applicationRepository.existsById(id)) {
                response.put("error", "Application not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            applicationRepository.deleteById(id);
            response.put("message", "Application deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to delete application: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private void createStatusNotification(JobApplication application, String previousStatus, String newStatus) {
        if (newStatus.equals(previousStatus)) {
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(application.getApplicantId());
        notification.setType("APPLICATION_" + newStatus);
        notification.setTitle(getNotificationTitle(newStatus));
        notification.setBody(getNotificationBody(application, newStatus));
        notificationRepository.save(notification);
    }

    private void createStatusMessage(JobApplication application, String previousStatus, String newStatus) {
        if (newStatus.equals(previousStatus)) {
            return;
        }

        Message message = new Message();
        message.setSenderId(application.getRecruiterId());
        message.setReceiverId(application.getApplicantId());
        message.setContent(getStatusMessageBody(application, newStatus));
        messageRepository.save(message);
    }

    private String getNotificationTitle(String status) {
        switch (status) {
            case "ACCEPTED":
                return "Application approved";
            case "REJECTED":
                return "Application rejected";
            case "REVIEWED":
                return "Application reviewed";
            default:
                return "Application updated";
        }
    }

    private String getNotificationBody(JobApplication application, String status) {
        switch (status) {
            case "ACCEPTED":
                return "Your application #" + application.getId() + " has been approved by the client.";
            case "REJECTED":
                return "Your application #" + application.getId() + " was not selected by the client.";
            case "REVIEWED":
                return "Your application #" + application.getId() + " is now under review.";
            default:
                return "Your application #" + application.getId() + " status changed to " + status + ".";
        }
    }

    private String getStatusMessageBody(JobApplication application, String status) {
        switch (status) {
            case "ACCEPTED":
                return "Your application #" + application.getId() + " has been approved. We will contact you with the next steps soon.";
            case "REJECTED":
                return "Your application #" + application.getId() + " was not selected. Thank you for applying.";
            case "REVIEWED":
                return "Your application #" + application.getId() + " has been reviewed. We may contact you for the next stage.";
            default:
                return "Your application #" + application.getId() + " status changed to " + status + ".";
        }
    }
}
