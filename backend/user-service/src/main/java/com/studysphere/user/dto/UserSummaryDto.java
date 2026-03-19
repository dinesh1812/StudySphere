package com.studysphere.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String fullName;
    private String role;
    private String collegeName;
    private Long collegeId;
}