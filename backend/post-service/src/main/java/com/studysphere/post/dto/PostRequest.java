package com.studysphere.post.dto;

import lombok.Data;

@Data
public class PostRequest {
    private String title;
    private String content;
    private Long authorId;
    private Long collegeId;
    private Long communityId; // If null, it goes to the General Feed
}