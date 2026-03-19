package com.studysphere.post.repository;

import com.studysphere.post.model.Post;
import com.studysphere.common.enums.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // 1. THE GENERAL FEED: Fetch posts where communityId is empty, newest first
    List<Post> findByCommunityIdIsNullAndStatusOrderByCreatedAtDesc(PostStatus status);

    // 2. THE COMMUNITY FEED: Fetch posts for a specific community, newest first
    List<Post> findByCommunityIdAndStatusOrderByCreatedAtDesc(Long communityId, PostStatus status);
    
    // (Optional: You can keep the collegeId query if you still want a college-specific general feed)
    List<Post> findByCollegeIdAndCommunityIdIsNullAndStatusOrderByCreatedAtDesc(Long collegeId, PostStatus status);

    // Fetch posts for SUPER ADMIN (All rejected or reported)
    @Query("SELECT p FROM Post p WHERE p.status = 'REJECTED' OR p.reportCount > 0")
    List<Post> findAllPostsForModeration();

    // Fetch posts for COLLEGE ADMIN (Only their college's rejected or reported posts)
    @Query("SELECT p FROM Post p WHERE p.collegeId = :collegeId AND (p.status = 'REJECTED' OR p.reportCount > 0)")
    List<Post> findPostsForCollegeModeration(@Param("collegeId") Long collegeId);
}