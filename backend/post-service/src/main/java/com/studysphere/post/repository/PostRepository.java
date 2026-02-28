package com.studysphere.post.repository;

import com.studysphere.post.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Fetches the feed for a specific college, newest first
    List<Post> findByCollegeIdOrderByCreatedAtDesc(Long collegeId);
}