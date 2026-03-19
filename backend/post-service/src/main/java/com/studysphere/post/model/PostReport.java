package com.studysphere.post.model;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
public class PostReport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long postId;
    private Long reporterId;
    private String reason;
}