package com.studysphere.post.controller;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.dto.CommentRequest;
import com.studysphere.post.dto.PostRequest;
import com.studysphere.post.dto.PostResponse;
import com.studysphere.post.model.Comment;
import com.studysphere.post.model.Post;
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
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@RequestBody PostRequest request) {
        PostResponse post = postService.createPost(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Post created successfully", post));
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getCollegeFeed(@PathVariable Long collegeId) {
        List<PostResponse> feed = postService.getCollegeFeed(collegeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Feed fetched successfully", feed));
    }

    @PutMapping("/{postId}/upvote")
    public ResponseEntity<ApiResponse<Post>> upvotePost(@PathVariable Long postId) {
        Post updatedPost = postService.upvotePost(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Post upvoted", updatedPost));
    }

    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<Comment>> addComment(@RequestBody CommentRequest request) {
        Comment comment = postService.addComment(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comment added successfully", comment));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable Long postId) {
        List<Comment> comments = postService.getCommentsForPost(postId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comments fetched successfully", comments));
    }
}