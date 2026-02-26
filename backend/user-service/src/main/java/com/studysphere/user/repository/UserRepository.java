package com.studysphere.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.studysphere.common.enums.AccountStatus;
import com.studysphere.user.model.User;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByEmail(String email);
    Optional <User> findByStudentId(String studentId);
    List<User> findByCollegeIdAndStatus(Long collegeId, AccountStatus status);
}
