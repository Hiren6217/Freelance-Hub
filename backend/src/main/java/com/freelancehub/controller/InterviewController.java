package com.freelancehub.controller;

import com.freelancehub.model.Interview;
import com.freelancehub.repository.InterviewRepository;
import com.freelancehub.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:3000")
public class InterviewController {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private InterviewService interviewService;

    // Schedule a Google Meet interview with a developer (client action).
    @PostMapping
    public ResponseEntity<?> createInterview(@RequestBody Map<String, Object> requestData) {
        Map<String, String> response = new HashMap<>();

        try {
            Long clientId = parseLong(requestData.get("clientId"));
            Long developerId = parseLong(requestData.get("developerId"));
            String meetingLink = normalizeLink(asString(requestData.get("meetingLink")));
            LocalDateTime scheduledAt = parseDateTime(requestData.get("scheduledAt"));

            if (clientId == null || developerId == null) {
                response.put("error", "clientId and developerId are required");
                return ResponseEntity.badRequest().body(response);
            }
            if (meetingLink == null) {
                response.put("error", "A Google Meet (or other) join link is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (scheduledAt == null) {
                response.put("error", "A valid scheduledAt date/time is required (e.g. 2026-09-25T14:30)");
                return ResponseEntity.badRequest().body(response);
            }

            Interview interview = new Interview();
            interview.setJobId(parseLong(requestData.get("jobId")));
            interview.setApplicationId(parseLong(requestData.get("applicationId")));
            interview.setClientId(clientId);
            interview.setDeveloperId(developerId);
            interview.setTitle(asString(requestData.get("title")));
            interview.setMeetingLink(meetingLink);
            interview.setScheduledAt(scheduledAt);
            interview.setNote(asString(requestData.get("note")));

            Interview saved = interviewService.scheduleInterview(interview);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            response.put("error", "Failed to schedule interview: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Interviews scheduled by a client
    @GetMapping("/client/{clientId}")
    public ResponseEntity<?> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(interviewRepository.findByClientIdOrderByScheduledAtDesc(clientId));
    }

    // Interviews a developer was invited to
    @GetMapping("/developer/{developerId}")
    public ResponseEntity<?> getByDeveloper(@PathVariable Long developerId) {
        return ResponseEntity.ok(interviewRepository.findByDeveloperIdOrderByScheduledAtDesc(developerId));
    }

    // Interviews tied to a specific application
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<?> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewRepository.findByApplicationIdOrderByScheduledAtDesc(applicationId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> requestData) {
        Map<String, String> response = new HashMap<>();
        try {
            String newStatus = requestData.get("status");
            if (!InterviewService.isValidStatus(newStatus)) {
                response.put("error", "Invalid status. Must be: SCHEDULED, CANCELLED, or COMPLETED");
                return ResponseEntity.badRequest().body(response);
            }

            Interview interview = interviewRepository.findById(id).orElse(null);
            if (interview == null) {
                response.put("error", "Interview not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Interview updated = interviewService.updateStatus(interview, newStatus);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            response.put("error", "Failed to update interview: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private static Long parseLong(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        return Long.valueOf(value.toString().trim());
    }

    private static LocalDateTime parseDateTime(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.toString().trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    // Accept links pasted without a scheme (e.g. "meet.google.com/abc-defg-hij").
    private static String normalizeLink(String link) {
        if (link == null) {
            return null;
        }
        String trimmed = link.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            return "https://" + trimmed;
        }
        return trimmed;
    }

    private static String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
