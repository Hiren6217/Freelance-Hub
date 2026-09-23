package com.freelancehub.repository;

import com.freelancehub.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    // Interviews the given user scheduled as the client
    List<Interview> findByClientIdOrderByScheduledAtDesc(Long clientId);

    // Interviews the given developer was invited to
    List<Interview> findByDeveloperIdOrderByScheduledAtDesc(Long developerId);

    // Interviews tied to a specific application (most recent first)
    List<Interview> findByApplicationIdOrderByScheduledAtDesc(Long applicationId);
}
