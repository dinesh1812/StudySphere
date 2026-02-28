package com.studysphere.post.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Data
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Long authorId;

    // We are using collegeId to associate posts with a specific college, which will help in filtering posts by college
    // This prevents foreign key constraints and allows for more flexible data management, especially if we want to allow posts that are not strictly tied to a college in the future.
    @Column(nullable = false)
    private Long collegeId;

    private int upvotes = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}