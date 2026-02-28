package com.studysphere.user.service;

import com.studysphere.common.enums.Role;
import com.studysphere.common.enums.AccountStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.studysphere.user.dto.CollegeAdminRegistrationDto;
import com.studysphere.user.dto.StudentRegistrationDto;
import com.studysphere.user.dto.UserSummaryDto;
import com.studysphere.user.model.College;
import com.studysphere.user.model.User;
import com.studysphere.user.repository.CollegeRepository;
import com.studysphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;

    // SUPER ADMIN ONLY: Creates a college in the system
    public College createCollege(String name, String domain) {
        College college = new College();
        college.setName(name);
        college.setDomain(domain);
        college.setApprovedBySuperAdmin(true); 
        return collegeRepository.save(college);
    }

    public User registerCollegeAdmin(CollegeAdminRegistrationDto dto) {
        College college = collegeRepository.findById(dto.getCollegeId())
                .orElseThrow(() -> new RuntimeException("College not found. Please contact Super Admin."));

        User admin = new User();
        admin.setFullName(dto.getAdminFullName());
        admin.setEmail(dto.getAdminEmail());
        admin.setPassword(passwordEncoder.encode(dto.getAdminPassword())); 
        admin.setStudentId("ADMIN-" + System.currentTimeMillis()); // Generate a unique ID
        admin.setRole(Role.COLLEGE_ADMIN);
        admin.setCollege(college);
        admin.setStatus(AccountStatus.PENDING); // Awaiting Super Admin approval

        return userRepository.save(admin);
    }

    public User registerStudent(StudentRegistrationDto dto) {
        College college = collegeRepository.findById(dto.getCollegeId())
                .orElseThrow(() -> new RuntimeException("College not found"));

        User student = new User();
        student.setFullName(dto.getFullName());
        student.setEmail(dto.getEmail());
        student.setPassword(passwordEncoder.encode(dto.getPassword())); 
        student.setStudentId(dto.getStudentId());
        student.setRole(Role.STUDENT);
        student.setCollege(college);
        student.setStatus(AccountStatus.PENDING); // Awaiting College Admin approval

        return userRepository.save(student);
    }

    // Handles both Super Admin approving C-Admins, and C-Admins approving Students
    public void approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(AccountStatus.APPROVED);
        userRepository.save(user);
    }

    public UserSummaryDto getUserSummary(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserSummaryDto(user.getId(), user.getFullName(), user.getRole().name());
    }
}