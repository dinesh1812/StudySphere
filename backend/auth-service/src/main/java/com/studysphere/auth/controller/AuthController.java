package com.studysphere.auth.controller;

import com.studysphere.auth.dto.AuthRequest;
import com.studysphere.auth.dto.AuthResponse;
import com.studysphere.auth.service.AuthService;
import com.studysphere.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.HttpStatus;
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
        } catch (BadCredentialsException e) {
            ApiResponse<Void> apiResponse = new ApiResponse<>(false, "Invalid email or password.", null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(apiResponse);
        } catch (Exception e) {
            String msg = e.getMessage();
            // Semantically correct: 403 Forbidden if we know the user but they can't log in yet
            if (msg != null && (msg.toLowerCase().contains("pending") || msg.toLowerCase().contains("rejected"))) {
                ApiResponse<Void> apiResponse = new ApiResponse<>(false, msg, null);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(apiResponse);
            }
            ApiResponse<Void> apiResponse = new ApiResponse<>(false, msg, null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }
}