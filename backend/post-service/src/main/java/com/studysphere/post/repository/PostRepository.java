package com.studysphere.post.repository;

import com.studysphere.post.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // 1. THE GENERAL FEED: Fetch posts where communityId is empty, newest first
    List<Post> findByCommunityIdIsNullOrderByCreatedAtDesc();

    // 2. THE COMMUNITY FEED: Fetch posts for a specific community, newest first
    List<Post> findByCommunityIdOrderByCreatedAtDesc(Long communityId);
    
    // (Optional: You can keep the collegeId query if you still want a college-specific general feed)
    List<Post> findByCollegeIdAndCommunityIdIsNullOrderByCreatedAtDesc(Long collegeId);
}