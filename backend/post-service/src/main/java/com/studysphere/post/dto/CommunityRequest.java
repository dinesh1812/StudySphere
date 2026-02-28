package com.studysphere.post.dto;

import lombok.Data;

@Data
public class CommunityRequest {
    private String name;
    private String description;
    private Long authorId;
}