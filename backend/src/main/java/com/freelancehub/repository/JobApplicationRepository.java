package com.freelancehub.repository;

import com.freelancehub.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    
    // Find all applications for a specific job
    List<JobApplication> findByJobId(Long jobId);
    
    // Find all applications by a specific applicant
    List<JobApplication> findByApplicantId(Long applicantId);
    
    // Find all applications for jobs posted by a recruiter
    List<JobApplication> findByRecruiterId(Long recruiterId);
    
    // Check if applicant has already applied to a job
    boolean existsByJobIdAndApplicantId(Long jobId, Long applicantId);
}
