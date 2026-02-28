package com.studysphere.post.service;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.client.UserClient;
import com.studysphere.post.dto.CommentRequest;
import com.studysphere.post.dto.PostRequest;
import com.studysphere.post.dto.PostResponse;
import com.studysphere.post.dto.UserSummaryDto;
import com.studysphere.post.model.Comment;
import com.studysphere.post.model.Post;
import com.studysphere.post.repository.CommentRepository;
import com.studysphere.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserClient userClient; // INJECT THE FEIGN CLIENT

    private PostResponse mapToPostResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setCollegeId(post.getCollegeId());
        response.setUpvotes(post.getUpvotes());
        response.setCreatedAt(post.getCreatedAt());

        try {
            // SECURE INTERNAL CALL: Fetch the author's details from the user-service
            ApiResponse<UserSummaryDto> apiResponse = userClient.getUserSummary(post.getAuthorId());
            if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                response.setAuthor(apiResponse.getData());
            }
        } catch (Exception e) {
            // FALLBACK: If the user-service is offline or throws an error, don't crash!
            UserSummaryDto fallbackUser = new UserSummaryDto();
            fallbackUser.setId(post.getAuthorId());
            fallbackUser.setFullName("Unknown User");
            fallbackUser.setRole("UNKNOWN");
            response.setAuthor(fallbackUser);
        }

        return response;
    }

    public PostResponse createPost(PostRequest request) {
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthorId(request.getAuthorId());
        post.setCollegeId(request.getCollegeId());
        
        Post savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost);
    }

    public List<PostResponse> getCollegeFeed(Long collegeId) {
        List<Post> posts = postRepository.findByCollegeIdOrderByCreatedAtDesc(collegeId);
        
        // Convert all Post entities to PostResponse DTOs
        return posts.stream()
                .map(this::mapToPostResponse)
                .collect(Collectors.toList());
    }

    public Post upvotePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setUpvotes(post.getUpvotes() + 1);
        return postRepository.save(post);
    }

    public Comment addComment(CommentRequest request) {
        // Ensure post exists before commenting
        postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setContent(request.getContent());
        comment.setAuthorId(request.getAuthorId());
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsForPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }
}