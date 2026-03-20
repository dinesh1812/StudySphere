package com.studysphere.post.controller;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.dto.EventRequest;
import com.studysphere.post.dto.EventResponse;
import com.studysphere.post.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // Secured in the Service layer (Only Admins)
    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @RequestBody EventRequest request,
            @RequestHeader("X-User-Id") Long trustedAdminId) {
            
        // SECURITY FIX (IDOR): Use the ID from the trusted Gateway header
        request.setAdminId(trustedAdminId);
        
        EventResponse event = eventService.createEvent(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Global event broadcasted successfully", event));
    }

    // Open to all authenticated students
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getGlobalEvents() {
        List<EventResponse> events = eventService.getGlobalEvents();
        return ResponseEntity.ok(new ApiResponse<>(true, "Global events fetched", events));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable Long eventId,
            @RequestHeader("X-User-Id") Long trustedAdminId) {
        eventService.deleteEvent(eventId, trustedAdminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Event deleted successfully", null));
    }
}