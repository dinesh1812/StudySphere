package com.studysphere.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import com.studysphere.user.model.College;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByDomain(String domain);
}
