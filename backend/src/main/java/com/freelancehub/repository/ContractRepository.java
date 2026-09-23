package com.freelancehub.repository;

import com.freelancehub.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    // Contracts where the given user is the client (recruiter)
    List<Contract> findByClientIdOrderByCreatedAtDesc(Long clientId);

    // Contracts where the given user is the hired developer
    List<Contract> findByDeveloperIdOrderByCreatedAtDesc(Long developerId);

    // A contract already created from a specific accepted application, if any
    Optional<Contract> findByApplicationId(Long applicationId);

    boolean existsByApplicationId(Long applicationId);
}
