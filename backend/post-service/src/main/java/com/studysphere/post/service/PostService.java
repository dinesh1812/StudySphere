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
import com.studysphere.post.repository.PostUpvoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostUpvoteRepository postUpvoteRepository;
    private final UserClient userClient; 

    // --- PRIVATE HELPER METHOD FOR DATA AGGREGATION ---
    private PostResponse mapToPostResponse(Post post, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setCollegeId(post.getCollegeId());
        response.setCommunityId(post.getCommunityId()); 
        response.setUpvotes(post.getUpvotes());
        response.setCreatedAt(post.getCreatedAt());

        if (currentUserId != null) {
            response.setUpvoted(postUpvoteRepository.existsByPostIdAndUserId(post.getId(), currentUserId));
        }

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

    // 1. CREATE POST 
    public PostResponse createPost(PostRequest request) {
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthorId(request.getAuthorId());
        post.setCollegeId(request.getCollegeId());
        post.setCommunityId(request.getCommunityId()); 
        
        Post savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost, request.getAuthorId());
    }

    // 2. FETCH GENERAL FEED 
    public List<PostResponse> getGeneralFeed(Long userId) {
        List<Post> posts = postRepository.findByCommunityIdIsNullOrderByCreatedAtDesc();
        return posts.stream().map(p -> this.mapToPostResponse(p, userId)).collect(Collectors.toList());
    }

    // 3. FETCH COMMUNITY FEED 
    public List<PostResponse> getCommunityFeed(Long communityId, Long userId) {
        List<Post> posts = postRepository.findByCommunityIdOrderByCreatedAtDesc(communityId);
        return posts.stream().map(p -> this.mapToPostResponse(p, userId)).collect(Collectors.toList());
    }

    // 4. UPVOTE POST (TOGGLE LOGIC)
    public PostResponse upvotePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        var existingUpvote = postUpvoteRepository.findByPostIdAndUserId(postId, userId);
        
        if (existingUpvote.isPresent()) {
            // User already upvoted, so UN-UPVOTE (toggle off)
            postUpvoteRepository.delete(existingUpvote.get());
            post.setUpvotes(Math.max(0, post.getUpvotes() - 1));
        } else {
            // User NOT upvoted yet, so UPVOTE (toggle on)
            com.studysphere.post.model.PostUpvote newUpvote = new com.studysphere.post.model.PostUpvote();
            newUpvote.setPostId(postId);
            newUpvote.setUserId(userId);
            postUpvoteRepository.save(newUpvote);
            post.setUpvotes(post.getUpvotes() + 1);
        }
        
        Post savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost, userId); 
    }

    // 5. ADD COMMENT
    public Comment addComment(CommentRequest request) {
        postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setContent(request.getContent());
        comment.setAuthorId(request.getAuthorId());
        return commentRepository.save(comment);
    }

    // 6. GET COMMENTS
    public List<Comment> getCommentsForPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }
}