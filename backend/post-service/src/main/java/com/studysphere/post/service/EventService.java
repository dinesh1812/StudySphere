package com.studysphere.post.service;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.client.UserClient;
import com.studysphere.post.dto.EventRequest;
import com.studysphere.post.dto.EventResponse;
import com.studysphere.post.dto.UserSummaryDto;
import com.studysphere.post.model.Event;
import com.studysphere.post.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserClient userClient;

    public EventResponse createEvent(EventRequest request) {
        // 1. ZERO-TRUST CHECK: Ask user-service who this is
        ApiResponse<UserSummaryDto> adminResponse = userClient.getUserSummary(request.getAdminId());
        
        if (!adminResponse.isSuccess() || adminResponse.getData() == null) {
            throw new RuntimeException("Could not verify user identity.");
        }

        UserSummaryDto adminUser = adminResponse.getData();

        // 2. Enforce Role: Only Admins can post global events
        if (!adminUser.getRole().equals("COLLEGE_ADMIN") && !adminUser.getRole().equals("SUPER_ADMIN")) {
            throw new RuntimeException("Security Violation: Only College Admins can post events.");
        }

        // 3. Save the event
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setLocation(request.getLocation());
        event.setHostCollegeId(request.getHostCollegeId());
        event.setCreatedBy(request.getAdminId());
        
        Event savedEvent = eventRepository.save(event);
        return mapToEventResponse(savedEvent, adminUser);
    }

    public List<EventResponse> getGlobalEvents() {
        List<Event> events = eventRepository.findAllByOrderByEventDateAsc();
        
        return events.stream().map(event -> {
            try {
                ApiResponse<UserSummaryDto> response = userClient.getUserSummary(event.getCreatedBy());
                return mapToEventResponse(event, response.getData());
            } catch (Exception e) {
                UserSummaryDto fallback = new UserSummaryDto(event.getCreatedBy(), "Unknown Admin", "UNKNOWN", "Unknown College", event.getHostCollegeId());
                return mapToEventResponse(event, fallback);
            }
        }).collect(Collectors.toList());
    }

    private EventResponse mapToEventResponse(Event event, UserSummaryDto adminData) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setEventDate(event.getEventDate());
        response.setLocation(event.getLocation());
        response.setHostCollegeId(event.getHostCollegeId());
        response.setHostAdmin(adminData);
        return response;
    }
}