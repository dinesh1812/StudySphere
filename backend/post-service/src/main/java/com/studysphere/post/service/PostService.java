package com.studysphere.post.service;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.client.ModerationClient;
import com.studysphere.post.client.UserClient;
import com.studysphere.post.dto.CommentRequest;
import com.studysphere.post.dto.CommentResponse;
import com.studysphere.post.dto.PostRequest;
import com.studysphere.post.dto.PostResponse;
import com.studysphere.post.dto.UserSummaryDto;
import com.studysphere.post.model.Comment;
import com.studysphere.post.model.Post;
import com.studysphere.post.model.PostDownvote;
import com.studysphere.post.model.PostReport;
import com.studysphere.common.enums.PostStatus;
import com.studysphere.post.repository.CommentRepository;
import com.studysphere.post.repository.PostDownvoteRepository;
import com.studysphere.post.repository.PostReportRepository;
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
    private final ModerationClient moderationClient;
    private final PostReportRepository postReportRepository;
    private final PostDownvoteRepository postDownvoteRepository;

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
            
            // 2. RUN THE AI MODERATION GAUNTLET
            String combinedText = request.getTitle() + " . " + request.getContent();
            try {
                ModerationClient.ModerationResponse modResponse = moderationClient.checkContent(new ModerationClient.ModerationRequest(combinedText));
                
                if (modResponse.isToxic()) {
                    // Save as REJECTED in the database so admins can review it later
                    post.setStatus(PostStatus.REJECTED);
                    postRepository.save(post);
                    
                    // Throw an error to block the user instantly
                    throw new RuntimeException("Post blocked by AI Moderator. " + modResponse.getReason());
                } else {
                    post.setStatus(PostStatus.APPROVED);
                }
            } catch (feign.FeignException e) {
                // If Python is offline, we can either block all posts or let them through. 
                // Let's log it and let it through as PENDING for manual review.
                System.out.println("AI Service Offline. Marking post as PENDING.");
                post.setStatus(PostStatus.PENDING);
            }
            
            Post savedPost = postRepository.save(post);
            return mapToPostResponse(savedPost, request.getAuthorId());
        }

    // NEW: Fetch a single post by ID
    public PostResponse getPostById(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToPostResponse(post, currentUserId);
    }

    // 2. FETCH GENERAL FEED 
    public List<PostResponse> getGeneralFeed(Long userId) {
        // Only get APPROVED posts
        List<Post> posts = postRepository.findByCommunityIdIsNullAndStatusOrderByCreatedAtDesc(PostStatus.APPROVED);
        return posts.stream().map(p -> this.mapToPostResponse(p, userId)).collect(Collectors.toList());
    }

    // 3. FETCH COMMUNITY FEED 
    public List<PostResponse> getCommunityFeed(Long communityId, Long userId) {
        // Only get APPROVED posts
        List<Post> posts = postRepository.findByCommunityIdAndStatusOrderByCreatedAtDesc(communityId, PostStatus.APPROVED);
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

    // 5. ADD COMMENT (Now AI-Powered)
    public Comment addComment(CommentRequest request) {
        // 1. Verify the post actually exists
        postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // 2. RUN THE AI MODERATION GAUNTLET
        try {
            ModerationClient.ModerationResponse modResponse = moderationClient.checkContent(
                    new ModerationClient.ModerationRequest(request.getContent())
            );
            
            if (modResponse.isToxic()) {
                // Instantly block and reject the comment
                throw new RuntimeException("Comment blocked by AI Moderator. " + modResponse.getReason());
            }
        } catch (feign.FeignException e) {
            // If the Python server is offline, we'll log it but let the comment through 
            // so the app doesn't break if the AI goes down.
            System.out.println("WARNING: AI Moderation offline. Comment allowed.");
        }

        // 3. If it survives the AI, save it to the database
        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setContent(request.getContent());
        comment.setAuthorId(request.getAuthorId());
        return commentRepository.save(comment);
    }

    // 6. GET COMMENTS (Enriched with Author Names)
    public List<CommentResponse> getCommentsForPost(Long postId) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        
        return comments.stream().map(comment -> {
            CommentResponse response = new CommentResponse();
            response.setId(comment.getId());
            response.setPostId(comment.getPostId());
            response.setContent(comment.getContent());
            response.setAuthorId(comment.getAuthorId());
            response.setCreatedAt(comment.getCreatedAt());

            try {
                ApiResponse<UserSummaryDto> userResponse = userClient.getUserSummary(comment.getAuthorId());
                if (userResponse.isSuccess() && userResponse.getData() != null) {
                    response.setAuthorName(userResponse.getData().getFullName());
                } else {
                    response.setAuthorName("Unknown User");
                }
            } catch (Exception e) {
                response.setAuthorName("Unknown User (Offline)");
            }
            return response;
        }).collect(Collectors.toList());
    }

    // --------------------------------------------------------
    // NEW FEATURES: DELETE, REPORT, MODERATE, AND DOWNVOTE
    // --------------------------------------------------------

    // 1. DELETE OWN POST
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Security Check: Only the author can delete it (or an admin, but we handle admin delete below)
        if (!post.getAuthorId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own posts.");
        }
        postRepository.delete(post);
    }

    // 2. REPORT A POST
    public void reportPost(Long postId, Long userId, String reason) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        
        PostReport report = new PostReport();
        report.setPostId(postId);
        report.setReporterId(userId);
        report.setReason(reason);
        postReportRepository.save(report);

        // Increment the report counter on the post
        post.setReportCount(post.getReportCount() + 1);
        postRepository.save(post);
    }

    // 3. ADMIN: GET MODERATION DASHBOARD
    public List<PostResponse> getModerationDashboard(Long adminId) {
        ApiResponse<UserSummaryDto> adminResponse = userClient.getUserSummary(adminId);
        if (!adminResponse.isSuccess() || adminResponse.getData() == null) {
            throw new RuntimeException("Admin identity could not be verified.");
        }
        UserSummaryDto admin = adminResponse.getData();

        List<Post> flaggedPosts;
        if (admin.getRole().equals("SUPER_ADMIN")) {
            flaggedPosts = postRepository.findAllPostsForModeration();
        } else if (admin.getRole().equals("COLLEGE_ADMIN")) {
            flaggedPosts = postRepository.findPostsForCollegeModeration(admin.getCollegeId());
        } else {
            throw new RuntimeException("Unauthorized: Only admins can access this dashboard.");
        }

        return flaggedPosts.stream().map(p -> mapToPostResponse(p, adminId)).collect(Collectors.toList());
    }

    // 4. ADMIN: RESOLVE MODERATION (Approve or Remove)
    @org.springframework.transaction.annotation.Transactional
    public void resolveModeratedPost(Long postId, Long adminId, String action) {
        // Same security check to ensure it's an admin
        UserSummaryDto admin = userClient.getUserSummary(adminId).getData();
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        // Tenant Isolation Check
        if (admin.getRole().equals("COLLEGE_ADMIN") && !admin.getCollegeId().equals(post.getCollegeId())) {
            throw new RuntimeException("Security Violation: You can only moderate posts from your own college.");
        }

        if (action.equalsIgnoreCase("APPROVE")) {
            post.setStatus(PostStatus.APPROVED);
            post.setReportCount(0); // Reset flags
            postRepository.save(post);
            postReportRepository.deleteByPostId(postId); // Clear reports
        } else if (action.equalsIgnoreCase("REMOVE")) {
            postRepository.delete(post); // Permanently delete toxic/bad post
        } else {
            throw new RuntimeException("Invalid action. Use APPROVE or REMOVE.");
        }
    }

    // 5. DOWNVOTE POST (With mutually exclusive toggle logic)
    public PostResponse downvotePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        // If they already upvoted, remove the upvote first
        postUpvoteRepository.findByPostIdAndUserId(postId, userId).ifPresent(upvote -> {
            postUpvoteRepository.delete(upvote);
            post.setUpvotes(Math.max(0, post.getUpvotes() - 1));
        });

        // Toggle Downvote Logic
        var existingDownvote = postDownvoteRepository.findByPostIdAndUserId(postId, userId);
        if (existingDownvote.isPresent()) {
            postDownvoteRepository.delete(existingDownvote.get()); // Toggle Off
            post.setDownvotes(Math.max(0, post.getDownvotes() - 1));
        } else {
            PostDownvote newDownvote = new PostDownvote(); // Toggle On
            newDownvote.setPostId(postId);
            newDownvote.setUserId(userId);
            postDownvoteRepository.save(newDownvote);
            post.setDownvotes(post.getDownvotes() + 1);
        }

        Post savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost, userId);
    }
}