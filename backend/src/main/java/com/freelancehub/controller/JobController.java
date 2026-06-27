package com.freelancehub.controller;

import com.freelancehub.dto.JobMatchResponse;
import com.freelancehub.model.Job;
import com.freelancehub.model.Skill;
import com.freelancehub.model.User;
import com.freelancehub.repository.JobRepository;
import com.freelancehub.repository.SkillRepository;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.service.JobMatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobMatchingService jobMatchingService;

    @Autowired
    private SkillRepository skillRepository;

    // Get all jobs (for developers to browse)
    @GetMapping
    public ResponseEntity<?> getAllJobs() {
        List<Job> jobs = jobRepository.findAllWithSkills();
        return ResponseEntity.ok(jobs);
    }

    // Get job by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        java.util.Optional<Job> job = jobRepository.findById(id);
        if (job.isPresent()) {
            return ResponseEntity.ok(job.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Job not found"));
        }
    }

    // Create a new job (for clients)
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        Map<String, String> response = new HashMap<>();

        // Validate required fields
        if (job.getTitle() == null || job.getTitle().isEmpty()) {
            response.put("error", "Job title is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (job.getCompany() == null || job.getCompany().isEmpty()) {
            response.put("error", "Company name is required");
            return ResponseEntity.badRequest().body(response);
        }

        if (job.getRecruiterId() == null) {
            response.put("error", "Recruiter ID is required");
            return ResponseEntity.badRequest().body(response);
        }

        // Link skills to the job
        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            Set<Skill> jobSkills = new HashSet<>();
            String[] skillNames = job.getSkills().split(",");
            for (String skillName : skillNames) {
                // Normalize to lowercase for consistency
                String normalizedName = skillName.trim().toLowerCase();
                Skill skill = skillRepository.findByNameIgnoreCase(normalizedName)
                    .orElse(new Skill(normalizedName, null));
                if (skill.getId() == null) {
                    skill = skillRepository.save(skill);
                }
                jobSkills.add(skill);
            }
            job.setSkillSet(jobSkills);
        }

        Job savedJob = jobRepository.save(job);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
    }

    // Update a job
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        java.util.Optional<Job> jobOptional = jobRepository.findById(id);
        if (jobOptional.isPresent()) {
            Job job = jobOptional.get();
            job.setTitle(jobDetails.getTitle());
            job.setCompany(jobDetails.getCompany());
            job.setLocation(jobDetails.getLocation());
            job.setJobType(jobDetails.getJobType());
            job.setDescription(jobDetails.getDescription());
            job.setSkills(jobDetails.getSkills());
            job.setReferralBonus(jobDetails.getReferralBonus());
            Job updatedJob = jobRepository.save(job);
            return ResponseEntity.ok(updatedJob);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Job not found"));
        }
    }

    // Delete a job
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        java.util.Optional<Job> jobOptional = jobRepository.findById(id);
        if (jobOptional.isPresent()) {
            jobRepository.delete(jobOptional.get());
            return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Job not found"));
        }
    }

    // Get jobs by recruiter (client)
    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<?> getJobsByRecruiter(@PathVariable Long recruiterId) {
        List<Job> jobs = jobRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId);
        return ResponseEntity.ok(jobs);
    }

    // Get matched jobs for the current user
    @GetMapping("/match")
    public ResponseEntity<?> getMatchedJobs(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        User user = userRepository.findByIdWithSkills(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        List<JobMatchResponse> matches = jobMatchingService.getMatchedJobs(user);
        return ResponseEntity.ok(matches);
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
