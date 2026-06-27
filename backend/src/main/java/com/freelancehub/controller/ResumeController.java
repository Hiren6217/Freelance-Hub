package com.freelancehub.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancehub.dto.ResumeUploadResponse;
import com.freelancehub.model.User;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.service.ResumeParsingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ResumeController {

    @Autowired
    private ResumeParsingService resumeParsingService;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/resume/upload")
    public ResponseEntity<ResumeUploadResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Extract userId from Authorization header (format: "Bearer token_<userId>_<timestamp>")
            Long userId = extractUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.badRequest().body(new ResumeUploadResponse(null, "Error uploading resume: User not authenticated", null));
            }

            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

            var resume = resumeParsingService.parseAndSaveResume(user, file);

            // Parse parsedData to create response
            JsonNode parsedJson = objectMapper.readTree(resume.getParsedData());
            ResumeUploadResponse.ParsedData parsedData = new ResumeUploadResponse.ParsedData(
                parsedJson.has("skills") ? objectMapper.convertValue(parsedJson.get("skills"), List.class) : List.of(),
                parsedJson.get("experience").asText(),
                parsedJson.get("education").asText(),
                parsedJson.has("keywords") ? objectMapper.convertValue(parsedJson.get("keywords"), List.class) : List.of()
            );

            ResumeUploadResponse response = new ResumeUploadResponse(resume.getId(), "Resume uploaded and parsed successfully", parsedData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResumeUploadResponse(null, "Error uploading resume: " + e.getMessage(), null));
        }
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7); // Remove "Bearer " prefix
                if (token.startsWith("token_")) {
                    String[] parts = token.split("_");
                    if (parts.length >= 2) {
                        return Long.parseLong(parts[1]);
                    }
                }
            } catch (Exception e) {
                // Invalid token format
            }
        }
        return null;
    }
}