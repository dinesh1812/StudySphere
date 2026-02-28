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
    private final UserClient userClient; 

    // --- PRIVATE HELPER METHOD FOR DATA AGGREGATION ---
    private PostResponse mapToPostResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setCollegeId(post.getCollegeId());
        response.setCommunityId(post.getCommunityId()); // BUG FIXED: Community ID is now mapped
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

    // 1. CREATE POST 
    public PostResponse createPost(PostRequest request) {
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthorId(request.getAuthorId());
        post.setCollegeId(request.getCollegeId());
        post.setCommunityId(request.getCommunityId()); 
        
        Post savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost);
    }

    // 2. FETCH GENERAL FEED 
    public List<PostResponse> getGeneralFeed() {
        List<Post> posts = postRepository.findByCommunityIdIsNullOrderByCreatedAtDesc();
        return posts.stream().map(this::mapToPostResponse).collect(Collectors.toList());
    }

    // 3. FETCH COMMUNITY FEED 
    public List<PostResponse> getCommunityFeed(Long communityId) {
        List<Post> posts = postRepository.findByCommunityIdOrderByCreatedAtDesc(communityId);
        return posts.stream().map(this::mapToPostResponse).collect(Collectors.toList());
    }

    // 4. UPVOTE POST (BUG FIXED: Now returns PostResponse)
    public PostResponse upvotePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setUpvotes(post.getUpvotes() + 1);
        Post savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost); 
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