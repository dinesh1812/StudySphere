package com.studysphere.post.repository;
import com.studysphere.post.model.CommentUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CommentUpvoteRepository extends JpaRepository<CommentUpvote, Long> {
    Optional<CommentUpvote> findByCommentIdAndUserId(Long commentId, Long userId);
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
}

