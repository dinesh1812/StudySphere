package com.studysphere.auth.controller;

import com.studysphere.auth.dto.AuthRequest;
import com.studysphere.auth.dto.AuthResponse;
import com.studysphere.auth.service.AuthService;
import com.studysphere.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            
            ApiResponse<AuthResponse> apiResponse = new ApiResponse<>(true, "Login successful", response);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            
            ApiResponse<Void> apiResponse = new ApiResponse<>(false, e.getMessage(), null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }
}