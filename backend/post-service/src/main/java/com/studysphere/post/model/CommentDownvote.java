package com.studysphere.post.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class CommentDownvote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long commentId;
    private Long userId;
}