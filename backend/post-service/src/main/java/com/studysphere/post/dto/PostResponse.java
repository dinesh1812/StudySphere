package com.studysphere.post.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private Long collegeId;
    private Long communityId; // If null, it goes to the General Feed
    private int upvotes;
    private LocalDateTime createdAt;
    
    // The aggregated data from the user-service!
    private UserSummaryDto author; 

    // Whether the current user has upvoted this post
    private boolean upvoted;
    private boolean downvoted;
}