package com.studysphere.post.controller;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.dto.CommentRequest;
import com.studysphere.post.dto.CommentResponse;
import com.studysphere.post.dto.PostRequest;
import com.studysphere.post.dto.PostResponse;
import com.studysphere.post.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @RequestBody PostRequest request,
            @RequestHeader("X-User-Id") Long trustedAuthorId) {
            
        // SECURITY FIX (IDOR): Force the authorId to be the authenticated user's ID
        request.setAuthorId(trustedAuthorId);
        
        PostResponse post = postService.createPost(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Post created successfully", post));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @PathVariable Long postId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        PostResponse post = postService.getPostById(postId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Post fetched successfully", post));
    }

    @GetMapping("/general")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getGeneralFeed(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        List<PostResponse> feed = postService.getGeneralFeed(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "General feed fetched", feed));
    }

    @GetMapping("/community/{communityId}")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getCommunityFeed(
            @PathVariable Long communityId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        List<PostResponse> feed = postService.getCommunityFeed(communityId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Community feed fetched", feed));
    }

    // UPVOTE POST (TOGGLE)
    @PutMapping("/{postId}/upvote")
    public ResponseEntity<ApiResponse<PostResponse>> upvotePost(
            @PathVariable Long postId,
            @RequestHeader("X-User-Id") Long userId) {
        PostResponse updatedPost = postService.upvotePost(postId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Upvote toggled", updatedPost));
    }

    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @RequestBody CommentRequest request,
            @RequestHeader("X-User-Id") Long trustedAuthorId) {
            
        // SECURITY FIX (IDOR): Force the authorId
        request.setAuthorId(trustedAuthorId);
        
        CommentResponse comment = postService.addComment(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comment added successfully", comment));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long postId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        List<CommentResponse> comments = postService.getCommentsForPost(postId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comments fetched successfully", comments));
    }

    // -------------------------------------------------------------
    // SECURED PHASE 9 ENDPOINTS (Replies & Comment Votes)
    // -------------------------------------------------------------

    @PostMapping("/comments/{commentId}/reply")
    public ResponseEntity<ApiResponse<CommentResponse>> addReply(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request,
            @RequestHeader("X-User-Id") Long trustedAuthorId) {
            
        request.setAuthorId(trustedAuthorId);
        CommentResponse reply = postService.addReplyToComment(commentId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reply added successfully", reply));
    }

    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getReplies(
            @PathVariable Long commentId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        List<CommentResponse> replies = postService.getRepliesForComment(commentId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Replies fetched successfully", replies));
    }

    @PutMapping("/comments/{commentId}/upvote")
    public ResponseEntity<ApiResponse<CommentResponse>> upvoteComment(
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long userId) {
        CommentResponse response = postService.upvoteComment(commentId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comment upvote toggled", response));
    }

    @PutMapping("/comments/{commentId}/downvote")
    public ResponseEntity<ApiResponse<CommentResponse>> downvoteComment(
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long userId) {
        CommentResponse response = postService.downvoteComment(commentId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comment downvote toggled", response));
    }

    // -------------------------------------------------------------
    // SECURED PHASE 8 ENDPOINTS (Using X-User-Id instead of RequestParam)
    // -------------------------------------------------------------

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long postId, 
            @RequestHeader("X-User-Id") Long userId) { // FIXED
        postService.deletePost(postId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Post deleted successfully", null));
    }

    @PostMapping("/{postId}/report")
    public ResponseEntity<ApiResponse<Void>> reportPost(
            @PathVariable Long postId, 
            @RequestHeader("X-User-Id") Long userId, // FIXED
            @RequestParam String reason) { // Reason is safe to be a query param
        postService.reportPost(postId, userId, reason);
        return ResponseEntity.ok(new ApiResponse<>(true, "Post reported to college admins", null));
    }

    @PutMapping("/{postId}/downvote")
    public ResponseEntity<ApiResponse<PostResponse>> downvotePost(
            @PathVariable Long postId, 
            @RequestHeader("X-User-Id") Long userId) { // FIXED
        PostResponse updatedPost = postService.downvotePost(postId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Post downvoted", updatedPost));
    }

    // --- ADMIN MODERATION ENDPOINTS ---

    @GetMapping("/moderation/dashboard")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getModerationDashboard(
            @RequestHeader("X-User-Id") Long adminId,
            @RequestHeader("X-User-Role") String role) { // FIXED: early role check
            
        if (!"SUPER_ADMIN".equals(role) && !"COLLEGE_ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "Forbidden: Only admins can access the moderation dashboard.", null));
        }
        
        List<PostResponse> flaggedPosts = postService.getModerationDashboard(adminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Moderation dashboard fetched", flaggedPosts));
    }

    @PutMapping("/{postId}/moderate")
    public ResponseEntity<ApiResponse<Void>> resolveModeratedPost(
            @PathVariable Long postId, 
            @RequestHeader("X-User-Id") Long adminId,
            @RequestHeader("X-User-Role") String role, // FIXED: early role check
            @RequestParam String action) { 
            
        if (!"SUPER_ADMIN".equals(role) && !"COLLEGE_ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "Forbidden: Only admins can moderate posts.", null));
        }
        
        postService.resolveModeratedPost(postId, adminId, action);
        return ResponseEntity.ok(new ApiResponse<>(true, "Post moderation resolved via action: " + action, null));
    }
}