package com.freelancehub.repository;

import com.freelancehub.model.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {

    List<TimeLog> findByContractIdOrderByCreatedAtDesc(Long contractId);

    List<TimeLog> findByDeveloperIdOrderByCreatedAtDesc(Long developerId);
}
