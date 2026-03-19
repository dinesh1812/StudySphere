package com.studysphere.post.repository;
import com.studysphere.post.model.PostDownvote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PostDownvoteRepository extends JpaRepository<PostDownvote, Long> {
    Optional<PostDownvote> findByPostIdAndUserId(Long postId, Long userId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}