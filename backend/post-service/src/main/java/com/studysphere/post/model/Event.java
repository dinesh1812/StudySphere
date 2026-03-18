package com.studysphere.post.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime eventDate; // When the event actually happens

    @Column(nullable = false)
    private String location; // e.g., "Main Auditorium, Stanford" or a Zoom link

    @Column(nullable = false)
    private Long hostCollegeId;

    @Column(nullable = false)
    private Long createdBy; // The College Admin who posted it

    @CreationTimestamp
    private LocalDateTime createdAt;
}