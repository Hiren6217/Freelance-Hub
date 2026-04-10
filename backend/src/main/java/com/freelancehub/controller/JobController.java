package com.freelancehub.controller;

import com.freelancehub.model.Job;
import com.freelancehub.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    // Get all jobs (for developers to browse)
    @GetMapping
    public ResponseEntity<?> getAllJobs() {
        List<Job> jobs = jobRepository.findByOrderByCreatedAtDesc();
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
}
