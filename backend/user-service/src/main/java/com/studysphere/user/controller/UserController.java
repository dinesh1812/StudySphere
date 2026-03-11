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
    public ResponseEntity<ApiResponse<College>> createCollege(@RequestParam String name, @RequestParam String domain) {
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
    // IDOR FIX: Now explicitly requires the adminId parameter
    @PutMapping("/approve/{userId}")
    public ResponseEntity<ApiResponse<Void>> approveUser(
            @PathVariable Long userId, 
            @RequestParam Long adminId) { 
        
        userService.approveUser(userId, adminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User approved successfully.", null));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getUserSummary(@PathVariable Long id) {
        UserSummaryDto summary = userService.getUserSummary(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User summary fetched", summary));
    }

    // Super Admin: list all pending College Admins
    @GetMapping("/pending-admins")
    public ResponseEntity<ApiResponse<List<User>>> getPendingCollegeAdmins() {
        List<User> pending = userService.getPendingCollegeAdmins();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending admins fetched", pending));
    }

    // College Admin: list pending students in their college
    @GetMapping("/colleges/{collegeId}/pending-students")
    public ResponseEntity<ApiResponse<List<User>>> getPendingStudents(@PathVariable Long collegeId) {
        List<User> pending = userService.getPendingStudentsForCollege(collegeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending students fetched", pending));
    }
}