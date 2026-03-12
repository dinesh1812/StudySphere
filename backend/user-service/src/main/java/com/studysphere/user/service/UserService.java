package com.studysphere.user.service;

import com.studysphere.common.enums.AccountStatus;
import com.studysphere.common.enums.Role;
import com.studysphere.user.dto.CollegeAdminRegistrationDto;
import com.studysphere.user.dto.StudentRegistrationDto;
import com.studysphere.user.dto.UserSummaryDto;
import com.studysphere.user.model.College;
import com.studysphere.user.model.User;
import com.studysphere.user.repository.CollegeRepository;
import com.studysphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

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

    // Unified Approval Endpoint: Super Admin approves C-Admins, C-Admins approve Students
    public void approveUser(Long targetUserId, Long adminId) {
        
        // 1. Fetch the Admin attempting the action
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found."));

        // 2. Verify they actually have admin privileges
        if (admin.getRole() != Role.COLLEGE_ADMIN && admin.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Unauthorized: Only administrators can perform approvals.");
        }

        // 3. Fetch the target User
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User to approve not found."));

        // 4. THE IDOR FIX: Strict Tenant Isolation & Hierarchy Check
        if (admin.getRole() == Role.COLLEGE_ADMIN) {
            
            // College Admins can ONLY approve Students
            if (targetUser.getRole() != Role.STUDENT) {
                throw new RuntimeException("Security Violation: College Admins can only approve students.");
            }
            
            // College Admins can ONLY approve Students in their exact same college
            if (admin.getCollege() == null || targetUser.getCollege() == null || 
                !admin.getCollege().getId().equals(targetUser.getCollege().getId())) {
                throw new RuntimeException("Security Violation: You can only approve students from your own college.");
            }
        }

        // 5. If they survive the gauntlet, approve the account
        targetUser.setStatus(AccountStatus.APPROVED);
        userRepository.save(targetUser);
    }

    public UserSummaryDto getUserSummary(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String collegeName = user.getCollege() != null ? user.getCollege().getName() : "N/A";
        return new UserSummaryDto(user.getId(), user.getFullName(), user.getRole().name(), collegeName);
    }

    // List all pending College Admins - called by Super Admin
    public List<User> getPendingCollegeAdmins() {
        return userRepository.findByRoleAndStatus(Role.COLLEGE_ADMIN, AccountStatus.PENDING);
    }

    // List all pending Students in a college - called by College Admin
    // BUG FIX: Filter by STUDENT role to exclude COLLEGE_ADMINs from the same college
    public List<User> getPendingStudentsForCollege(Long collegeId) {
        return userRepository.findByCollegeIdAndRoleAndStatus(collegeId, Role.STUDENT, AccountStatus.PENDING);
    }

    // List all approved Students in a college - called by College Admin
    // BUG FIX: Filter by STUDENT role to exclude COLLEGE_ADMINs from the same college
    public List<User> getApprovedStudentsForCollege(Long collegeId) {
        return userRepository.findByCollegeIdAndRoleAndStatus(collegeId, Role.STUDENT, AccountStatus.APPROVED);
    }

    // List all approved College Admins - called by Super Admin
    public List<User> getApprovedCollegeAdmins() {
        return userRepository.findByRoleAndStatus(Role.COLLEGE_ADMIN, AccountStatus.APPROVED);
    }

    // Reject a user (set status to REJECTED)
    public void rejectUser(Long targetUserId, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found."));

        if (admin.getRole() != Role.COLLEGE_ADMIN && admin.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Unauthorized: Only administrators can reject users.");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User to reject not found."));

        // College Admins can only reject Students from their own college
        if (admin.getRole() == Role.COLLEGE_ADMIN) {
            if (targetUser.getRole() != Role.STUDENT) {
                throw new RuntimeException("Security Violation: College Admins can only reject students.");
            }
            if (admin.getCollege() == null || targetUser.getCollege() == null ||
                !admin.getCollege().getId().equals(targetUser.getCollege().getId())) {
                throw new RuntimeException("Security Violation: You can only reject students from your own college.");
            }
        }

        targetUser.setStatus(AccountStatus.REJECTED);
        userRepository.save(targetUser);
    }

    // List all colleges (for signup dropdown)
    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }
}