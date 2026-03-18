package com.studysphere.post.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventRequest {
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String location;
    private Long hostCollegeId;
    private Long adminId;
}