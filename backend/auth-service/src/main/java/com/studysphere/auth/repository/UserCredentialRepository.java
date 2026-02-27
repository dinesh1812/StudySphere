package com.studysphere.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studysphere.auth.model.UserCredential;

@Repository
public interface UserCredentialRepository extends JpaRepository<UserCredential, Long>{
    Optional<UserCredential> findByEmail(String email);
}
