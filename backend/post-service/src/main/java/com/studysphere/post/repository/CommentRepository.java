package com.studysphere.post.repository;

import com.studysphere.post.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // FETCH TOP LEVEL COMMENTS ONLY
    List<Comment> findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(Long postId);

    // FETCH REPLIES FOR A SPECIFIC COMMENT
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(Long parentCommentId);
}