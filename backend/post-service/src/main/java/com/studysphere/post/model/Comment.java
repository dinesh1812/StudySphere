package com.studysphere.post.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Long authorId;

    // --- NEW: THREADING SUPPORT ---
    @Column(name = "parent_comment_id")
    private Long parentCommentId; // Null = Top-level comment. Has ID = Reply.

    // --- NEW: AI METRICS COUNTERS ---
    @Column(nullable = false)
    private int upvotes = 0;

    @Column(nullable = false)
    private int downvotes = 0;

    @Column(nullable = false)
    private int replyCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}