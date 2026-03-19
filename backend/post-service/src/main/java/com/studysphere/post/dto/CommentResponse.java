package com.studysphere.post.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    private Long postId;
    private String content;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
}
