package com.freelancehub.repository;

import com.freelancehub.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByName(String name);
    
    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) = LOWER(:name)")
    Optional<Skill> findByNameIgnoreCase(String name);
}