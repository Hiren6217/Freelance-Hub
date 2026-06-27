package com.freelancehub.repository;

import com.freelancehub.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByOrderByCreatedAtDesc();
    List<Job> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    @Query("SELECT j FROM Job j LEFT JOIN FETCH j.skillSet")
    List<Job> findAllWithSkills();
}
