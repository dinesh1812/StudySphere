package com.studysphere.post.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private Long collegeId;
    private int upvotes;
    private LocalDateTime createdAt;
    
    // The aggregated data from the user-service!
    private UserSummaryDto author; 
}