package com.studysphere.post.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class CommentUpvote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long commentId;
    private Long userId;
}