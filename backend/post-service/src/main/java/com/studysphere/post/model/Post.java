package com.studysphere.post.model;

import com.studysphere.common.enums.PostStatus;
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

    private Long communityId;

    @Column(nullable = false)
    private int upvotes = 0;

    @Column(nullable = false)
    private int downvotes = 0;

    @Column(nullable = false)
    private int reportCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.APPROVED;

    @CreationTimestamp
    private LocalDateTime createdAt;
}