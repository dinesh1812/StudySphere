package com.studysphere.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "colleges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class College {

    // Primary key for the College entity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Name of the college, must be unique and cannot be null
    @Column(nullable = false, unique = true)
    private String name;

    // Domain associated with the college, must be unique and cannot be null
    @Column(nullable = false, unique = true)
    private String domain; 

    // Flag to indicate if the college has been approved by the super admin, defaults to false
    private boolean isApprovedBySuperAdmin = false;
}