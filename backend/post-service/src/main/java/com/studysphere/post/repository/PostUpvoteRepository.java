package com.studysphere.post.repository;

import com.studysphere.post.model.PostUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostUpvoteRepository extends JpaRepository<PostUpvote, Long> {
    Optional<PostUpvote> findByPostIdAndUserId(Long postId, Long userId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}
