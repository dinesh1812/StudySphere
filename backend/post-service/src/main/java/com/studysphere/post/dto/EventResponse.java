package com.studysphere.post.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String location;
    private Long hostCollegeId;
    
    // Aggegated data via OpenFeign
    private UserSummaryDto hostAdmin; 
}