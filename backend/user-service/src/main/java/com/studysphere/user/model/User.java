package com.studysphere.user.model;

import com.studysphere.common.enums.AccountStatus;
import com.studysphere.common.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    // Primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique student ID for each user
    @Column(nullable = false, unique = true)
    private String studentId; 

    // Full name of the user
    @Column(nullable = false)
    private String fullName;

    // Unique email address for each user
    @Column(nullable = false, unique = true)
    private String email;

    // Password for authentication
    @Column(nullable = false)
    private String password; 

    // Role of the user (STUDENT, COLLEGE_ADMIN, SUPER_ADMIN)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Account status (PENDING, APPROVED, BLOCKED)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;

    // Many-to-one relationship with College
    @ManyToOne
    @JoinColumn(name = "college_id")
    private College college;


    // Account creation timestamp
    private LocalDateTime createdAt = LocalDateTime.now();
}