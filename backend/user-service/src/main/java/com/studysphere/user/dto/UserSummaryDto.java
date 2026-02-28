package com.studysphere.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String fullName;
    private String role;
}