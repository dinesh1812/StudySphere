package com.studysphere.user.controller;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.user.dto.CollegeAdminRegistrationDto;
import com.studysphere.user.dto.StudentRegistrationDto;
import com.studysphere.user.dto.UserSummaryDto;
import com.studysphere.user.model.College;
import com.studysphere.user.model.User;
import com.studysphere.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // SUPER ADMIN ONLY: Create a new college
    @PostMapping("/colleges")
    public ResponseEntity<ApiResponse<College>> createCollege(
            @RequestParam String name, 
            @RequestParam String domain,
            @RequestHeader("X-User-Role") String role) {
            
        // Security Check: Only Super Admins can provision colleges
        if (!"SUPER_ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "Forbidden: Only Super Admins can create colleges.", null));
        }
        
        College createdCollege = userService.createCollege(name, domain);
        return ResponseEntity.ok(new ApiResponse<>(true, "College created successfully.", createdCollege));
    }

    // Register a College Admin (Assigns PENDING status)
    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse<User>> registerCollegeAdmin(@RequestBody CollegeAdminRegistrationDto dto) {
        User createdUser = userService.registerCollegeAdmin(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "College Admin registered. Waiting for Super Admin approval.", createdUser));
    }

    // Register a Student (Assigns PENDING status)
    @PostMapping("/register/student")
    public ResponseEntity<ApiResponse<User>> registerStudent(@RequestBody StudentRegistrationDto dto) {
        User createdUser = userService.registerStudent(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student registered. Waiting for College Admin approval.", createdUser));
    }

    // Unified Approval Endpoint: Super Admin approves C-Admins, C-Admins approve Students
    // SECURITY FIX: Now uses the trusted X-User-Id header injected by the API Gateway instead of a spoofable request param
    @PutMapping("/approve/{userId}")
    public ResponseEntity<ApiResponse<Void>> approveUser(
            @PathVariable Long userId, 
            @RequestHeader("X-User-Id") Long trustedAdminId) { 
        
        userService.approveUser(userId, trustedAdminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User approved successfully.", null));
    }

    // Reject a user (Super Admin rejects C-Admins, C-Admins reject Students)
    @PutMapping("/reject/{userId}")
    public ResponseEntity<ApiResponse<Void>> rejectUser(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long trustedAdminId) {

        userService.rejectUser(userId, trustedAdminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User rejected successfully.", null));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getUserSummary(@PathVariable Long id) {
        UserSummaryDto summary = userService.getUserSummary(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User summary fetched", summary));
    }

    // Super Admin: list all pending College Admins
    @GetMapping("/pending-admins")
    public ResponseEntity<ApiResponse<List<User>>> getPendingCollegeAdmins(
            @RequestHeader("X-User-Role") String role) {
            
        if (!"SUPER_ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "Forbidden: Only Super Admins can see pending admins.", null));
        }
        
        List<User> pending = userService.getPendingCollegeAdmins();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending admins fetched", pending));
    }

    // College Admin: list pending students in their college
    @GetMapping("/colleges/{collegeId}/pending-students")
    public ResponseEntity<ApiResponse<List<User>>> getPendingStudents(
            @PathVariable Long collegeId,
            @RequestHeader("X-User-Id") Long trustedUserId,
            @RequestHeader("X-User-Role") String role) {
            
        // SECURITY: Verify this admin belongs to THIS college (unless Super Admin)
        if (!"SUPER_ADMIN".equals(role)) {
            if (!"COLLEGE_ADMIN".equals(role)) {
                return ResponseEntity.status(403).body(new ApiResponse<>(false, "Forbidden: Only admins can see students.", null));
            }
            // Check if the collegeId matches the admin's college
            User admin = userService.getUserById(trustedUserId);
            if (admin.getCollege() == null || !admin.getCollege().getId().equals(collegeId)) {
                return ResponseEntity.status(403).body(new ApiResponse<>(false, "Security Violation: You can only see students in your own college.", null));
            }
        }

        List<User> pending = userService.getPendingStudentsForCollege(collegeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending students fetched", pending));
    }

    // College Admin: list approved students in their college
    @GetMapping("/colleges/{collegeId}/approved-students")
    public ResponseEntity<ApiResponse<List<User>>> getApprovedStudents(
            @PathVariable Long collegeId,
            @RequestHeader("X-User-Id") Long trustedUserId,
            @RequestHeader("X-User-Role") String role) {
            
        // SECURITY: Verify this admin belongs to THIS college (unless Super Admin)
        if (!"SUPER_ADMIN".equals(role)) {
            if (!"COLLEGE_ADMIN".equals(role)) {
                return ResponseEntity.status(403).body(new ApiResponse<>(false, "Forbidden: Only admins can see students.", null));
            }
            User admin = userService.getUserById(trustedUserId);
            if (admin.getCollege() == null || !admin.getCollege().getId().equals(collegeId)) {
                return ResponseEntity.status(403).body(new ApiResponse<>(false, "Security Violation: You can only see students in your own college.", null));
            }
        }

        List<User> approved = userService.getApprovedStudentsForCollege(collegeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Approved students fetched", approved));
    }

    // Super Admin: list all approved college admins
    @GetMapping("/approved-admins")
    public ResponseEntity<ApiResponse<List<User>>> getApprovedCollegeAdmins(
            @RequestHeader("X-User-Role") String role) {
            
        if (!"SUPER_ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "Forbidden: Only Super Admins can see approved admins.", null));
        }
        
        List<User> approved = userService.getApprovedCollegeAdmins();
        return ResponseEntity.ok(new ApiResponse<>(true, "Approved admins fetched", approved));
    }

    // Public: list all colleges (for signup dropdown)
    @GetMapping("/colleges/all")
    public ResponseEntity<ApiResponse<List<College>>> getAllColleges() {
        List<College> colleges = userService.getAllColleges();
        return ResponseEntity.ok(new ApiResponse<>(true, "Colleges fetched", colleges));
    }
}