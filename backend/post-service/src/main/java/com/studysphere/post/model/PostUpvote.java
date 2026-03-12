package com.studysphere.post.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "post_upvotes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"postId", "userId"})
})
@Data
public class PostUpvote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId;

    @Column(nullable = false)
    private Long userId;
}
