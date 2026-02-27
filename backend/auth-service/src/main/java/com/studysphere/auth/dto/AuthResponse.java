package com.studysphere.auth.dto;

import com.studysphere.common.enums.Role;
import com.studysphere.common.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private Role role;
    private AccountStatus status;
}