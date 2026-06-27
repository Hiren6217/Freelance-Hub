package com.freelancehub.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category;

    @ManyToMany(mappedBy = "skillSet")
    private Set<Job> jobs;

    @ManyToMany(mappedBy = "skills")
    private Set<User> users;

    // Constructors
    public Skill() {}

    public Skill(String name, String category) {
        this.name = name;
        this.category = category;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Set<Job> getJobs() { return jobs; }
    public void setJobs(Set<Job> jobs) { this.jobs = jobs; }

    public Set<User> getUsers() { return users; }
    public void setUsers(Set<User> users) { this.users = users; }
}