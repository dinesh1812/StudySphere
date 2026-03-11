package com.studysphere.auth.model;

import com.studysphere.common.enums.Role;
import com.studysphere.common.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class UserCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;

    // Read-only: this column is owned by user-service. We just read it for the login response.
    @Column(name = "college_id", insertable = false, updatable = false)
    private Long collegeId;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private AccountStatus status;
}