package com.studysphere.post.controller;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.dto.CommunityRequest;
import com.studysphere.post.model.Community;
import com.studysphere.post.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    public ResponseEntity<ApiResponse<Community>> createCommunity(@RequestBody CommunityRequest request) {
        Community community = communityService.createCommunity(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Community created", community));
    }

    @PostMapping("/{communityId}/join")
    public ResponseEntity<ApiResponse<String>> joinCommunity(@PathVariable Long communityId, @RequestParam Long studentId) {
        String message = communityService.joinCommunity(communityId, studentId);
        return ResponseEntity.ok(new ApiResponse<>(true, message, null));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Community>>> getAllCommunities() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Communities fetched", communityService.getAllCommunities()));
    }
}