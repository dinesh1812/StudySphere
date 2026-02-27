package com.studysphere.auth.service;

import com.studysphere.auth.dto.AuthRequest;
import com.studysphere.auth.dto.AuthResponse;
import com.studysphere.auth.model.UserCredential;
import com.studysphere.auth.repository.UserCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserCredentialRepository repository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        // 1. Tell Spring Security to verify the email and password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. If it succeeds, grab the user from the database
        UserCredential user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Prevent unapproved users from getting a token
        if (!user.getStatus().name().equals("APPROVED")) {
            throw new RuntimeException("Account is pending approval or blocked.");
        }

        // 4. Generate the JWT
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        // 5. Return the token and user details to the frontend
        return new AuthResponse(token, user.getId(), user.getRole(), user.getStatus());
    }
}