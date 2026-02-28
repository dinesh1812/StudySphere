package com.studysphere.post.repository;

import com.studysphere.post.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    boolean existsByName(String name);
}