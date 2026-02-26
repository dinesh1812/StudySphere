package com.studysphere.user.dto;

import lombok.Data;

@Data
public class StudentRegistrationDto {
    private String fullName;
    private String email;
    private String password;
    private String studentId;
    private Long collegeId;
}
