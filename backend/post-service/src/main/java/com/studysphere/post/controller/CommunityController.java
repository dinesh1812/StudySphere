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
    public ResponseEntity<ApiResponse<Community>> createCommunity(
            @RequestBody CommunityRequest request,
            @RequestHeader("X-User-Id") Long trustedAuthorId) {
            
        // SECURITY FIX (IDOR): Force the authorId
        request.setAuthorId(trustedAuthorId);
        
        Community community = communityService.createCommunity(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Community created", community));
    }

    @PostMapping("/{communityId}/join")
    public ResponseEntity<ApiResponse<String>> joinCommunity(
            @PathVariable Long communityId, 
            @RequestHeader("X-User-Id") Long trustedStudentId) {
            
        String message = communityService.joinCommunity(communityId, trustedStudentId);
        return ResponseEntity.ok(new ApiResponse<>(true, message, null));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Community>>> getMyCommunities(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Your joined communities fetched", communityService.getJoinedCommunities(userId)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Community>>> getAllCommunities() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All communities fetched", communityService.getAllCommunities()));
    }

    @GetMapping("/joined")
    public ResponseEntity<ApiResponse<List<Long>>> getJoinedCommunities(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Joined community IDs fetched", communityService.getJoinedCommunityIds(userId)));
    }

    @DeleteMapping("/{communityId}")
    public ResponseEntity<ApiResponse<Void>> deleteCommunity(
            @PathVariable Long communityId,
            @RequestHeader("X-User-Id") Long userId) {
        communityService.deleteCommunity(communityId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Community deleted successfully", null));
    }

    @DeleteMapping("/{communityId}/leave")
    public ResponseEntity<ApiResponse<String>> leaveCommunity(
            @PathVariable Long communityId,
            @RequestHeader("X-User-Id") Long trustedStudentId) {
        communityService.leaveCommunity(communityId, trustedStudentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Successfully left community", null));
    }

    @GetMapping("/{communityId}/members")
    public ResponseEntity<ApiResponse<List<com.studysphere.post.model.CommunityMember>>> getMembers(
            @PathVariable Long communityId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Members fetched", communityService.getCommunityMembers(communityId)));
    }

    @DeleteMapping("/{communityId}/members/{studentId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long communityId,
            @PathVariable Long studentId,
            @RequestHeader("X-User-Id") Long creatorId) {
        communityService.removeMember(communityId, creatorId, studentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Member removed successfully", null));
    }
}