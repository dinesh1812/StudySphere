package com.studysphere.post.controller;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.dto.CommentRequest;
import com.studysphere.post.dto.PostRequest;
import com.studysphere.post.dto.PostResponse;
import com.studysphere.post.model.Comment;
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
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @RequestBody CommentRequest request,
            @RequestHeader("X-User-Id") Long trustedAuthorId) {
            
        // SECURITY FIX (IDOR): Force the authorId
        request.setAuthorId(trustedAuthorId);
        
        Comment comment = postService.addComment(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comment added successfully", comment));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable Long postId) {
        List<Comment> comments = postService.getCommentsForPost(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comments fetched successfully", comments));
    }
}