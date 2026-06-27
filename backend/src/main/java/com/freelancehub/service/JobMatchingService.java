package com.freelancehub.service;

import com.freelancehub.dto.JobMatchResponse;
import com.freelancehub.model.Job;
import com.freelancehub.model.Skill;
import com.freelancehub.model.User;
import com.freelancehub.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobMatchingService {

    @Autowired
    private JobRepository jobRepository;

    public List<JobMatchResponse> getMatchedJobs(User user) {
        List<Job> jobs = jobRepository.findAllWithSkills();
        Set<Skill> userSkills = user.getSkills();

        System.out.println("DEBUG: User ID: " + user.getId());
        System.out.println("DEBUG: User skills: " + (userSkills != null ? userSkills.stream().map(Skill::getName).collect(Collectors.toList()) : "null"));
        System.out.println("DEBUG: Number of jobs: " + jobs.size());

        if (userSkills == null || userSkills.isEmpty()) {
            System.out.println("DEBUG: User has no skills");
            return Collections.emptyList();
        }

        List<JobMatchResponse> matches = new ArrayList<>();
        for (Job job : jobs) {
            Set<Skill> jobSkills = job.getSkillSet();
            System.out.println("DEBUG: Job ID: " + job.getId() + ", Job skills: " + (jobSkills != null ? jobSkills.stream().map(Skill::getName).collect(Collectors.toList()) : "null"));
            if (jobSkills != null && !jobSkills.isEmpty()) {
                double score = calculateMatchScore(userSkills, jobSkills);
                List<String> matchedSkills = getMatchedSkills(userSkills, jobSkills);
                System.out.println("DEBUG: Match score: " + score + ", Matched skills: " + matchedSkills);
                if (score > 0) {
                    matches.add(new JobMatchResponse(job, score, matchedSkills));
                }
            }
        }

        System.out.println("DEBUG: Total matches found: " + matches.size());
        // Sort by score descending
        matches.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
        return matches;
    }

    private double calculateMatchScore(Set<Skill> userSkills, Set<Skill> jobSkills) {
        Set<String> userSkillNames = userSkills.stream().map(Skill::getName).collect(Collectors.toSet());
        Set<String> jobSkillNames = jobSkills.stream().map(Skill::getName).collect(Collectors.toSet());

        Set<String> intersection = new HashSet<>(userSkillNames);
        intersection.retainAll(jobSkillNames);

        Set<String> union = new HashSet<>(userSkillNames);
        union.addAll(jobSkillNames);

        if (union.isEmpty()) return 0.0;

        return (double) intersection.size() / union.size() * 100; // Jaccard similarity * 100
    }

    private List<String> getMatchedSkills(Set<Skill> userSkills, Set<Skill> jobSkills) {
        Set<String> userSkillNames = userSkills.stream().map(Skill::getName).collect(Collectors.toSet());
        Set<String> jobSkillNames = jobSkills.stream().map(Skill::getName).collect(Collectors.toSet());

        Set<String> intersection = new HashSet<>(userSkillNames);
        intersection.retainAll(jobSkillNames);

        return new ArrayList<>(intersection);
    }
}