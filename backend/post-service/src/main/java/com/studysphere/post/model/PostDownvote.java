package com.studysphere.post.model;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
public class PostDownvote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long postId;
    private Long userId;
}