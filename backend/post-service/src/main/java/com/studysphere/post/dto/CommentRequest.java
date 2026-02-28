package com.studysphere.post.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private Long postId;
    private String content;
    private Long authorId;
}