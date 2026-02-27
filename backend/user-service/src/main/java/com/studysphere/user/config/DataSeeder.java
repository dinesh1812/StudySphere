package com.studysphere.user.config;

import com.studysphere.common.enums.Role;
import com.studysphere.common.enums.AccountStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.studysphere.user.model.User;
import com.studysphere.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${superadmin.password}")
    private String superAdminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Check if a Super Admin already exists to prevent duplicates on restart
        if (userRepository.findByEmail("superadmin@studysphere.com").isEmpty()) {
            User superAdmin = new User();
            superAdmin.setFullName("System Super Admin");
            superAdmin.setEmail("superadmin@studysphere.com");
            superAdmin.setPassword(passwordEncoder.encode(superAdminPassword));
            superAdmin.setStudentId("SUPER-ADMIN-01");
            superAdmin.setRole(Role.SUPER_ADMIN);
            superAdmin.setStatus(AccountStatus.APPROVED); 
            
            userRepository.save(superAdmin);
            System.out.println("Super Admin seeded securely into the database with APPROVED status.");
        }
    }
}