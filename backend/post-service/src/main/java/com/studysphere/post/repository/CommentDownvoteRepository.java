package com.studysphere.post.repository;
import com.studysphere.post.model.CommentDownvote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CommentDownvoteRepository extends JpaRepository<CommentDownvote, Long> {
    Optional<CommentDownvote> findByCommentIdAndUserId(Long commentId, Long userId);
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
}