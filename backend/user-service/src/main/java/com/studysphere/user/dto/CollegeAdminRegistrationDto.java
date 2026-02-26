package com.studysphere.user.dto;

import lombok.Data;

@Data
public class CollegeAdminRegistrationDto {
    private String adminFullName;
    private String adminEmail;
    private String adminPassword;
    private Long collegeId;
}