package com.studysphere.post.service;

import feign.FeignException;

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
import com.studysphere.post.model.PostUpvote;
import com.studysphere.post.model.CommentUpvote;
import com.studysphere.post.model.CommentDownvote;
import com.studysphere.common.enums.PostStatus;
import com.studysphere.post.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final EventRepository eventRepository;
    private final PostUpvoteRepository postUpvoteRepository;
    private final UserClient userClient;
    private final CommunityMemberRepository communityMemberRepository;
    private final ModerationClient moderationClient;
    private final PostReportRepository postReportRepository;
    private final PostDownvoteRepository postDownvoteRepository;
    private final CommentUpvoteRepository commentUpvoteRepository;
    private final CommentDownvoteRepository commentDownvoteRepository;

    // --- PRIVATE HELPER METHOD FOR DATA AGGREGATION ---
    private PostResponse mapToPostResponse(Post post, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setCollegeId(post.getCollegeId());
        response.setCommunityId(post.getCommunityId());
        response.setUpvotes(post.getUpvotes());
        response.setDownvotes(post.getDownvotes());
        response.setCreatedAt(post.getCreatedAt());

        if (currentUserId != null) {
            response.setUpvoted(postUpvoteRepository.existsByPostIdAndUserId(post.getId(), currentUserId));
            response.setDownvoted(postDownvoteRepository.existsByPostIdAndUserId(post.getId(), currentUserId));
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
            } catch (FeignException e) {
                System.out.println("AI Service Offline. Marking post as PENDING.");
                post.setStatus(PostStatus.PENDING);
            }
            
            // 3. Security Check: If posting to a community, verify membership
            if (request.getCommunityId() != null) {
                if (!communityMemberRepository.existsByCommunityIdAndStudentId(request.getCommunityId(), request.getAuthorId())) {
                    throw new RuntimeException("Security Violation: You must join this community before posting.");
                }
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
        List<Post> posts = postRepository.findByCommunityIdAndStatusOrderByCreatedAtDesc(communityId,
                PostStatus.APPROVED);
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
            // If they already downvoted, remove the downvote first
            postDownvoteRepository.findByPostIdAndUserId(postId, userId).ifPresent(downvote -> {
                postDownvoteRepository.delete(downvote);
                post.setDownvotes(Math.max(0, post.getDownvotes() - 1));
            });

            // User NOT upvoted yet, so UPVOTE (toggle on)
            PostUpvote newUpvote = new PostUpvote();
            newUpvote.setPostId(postId);
            newUpvote.setUserId(userId);
            postUpvoteRepository.save(newUpvote);
            post.setUpvotes(post.getUpvotes() + 1);
        }

        Post savedPost = postRepository.save(post);
        return mapToPostResponse(savedPost, userId);
    }

    // 5. ADD COMMENT (Now AI-Powered)
    public CommentResponse addComment(CommentRequest request) {
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // SECURITY CHECK: If this is a community post, verify membership
        if (post.getCommunityId() != null) {
            if (!communityMemberRepository.existsByCommunityIdAndStudentId(post.getCommunityId(),
                    request.getAuthorId())) {
                throw new RuntimeException("Security Violation: You must be a member of this community to comment.");
            }
        }

        // 2. RUN THE AI MODERATION GAUNTLET
        try {
            ModerationClient.ModerationResponse modResponse = moderationClient.checkContent(
                    new ModerationClient.ModerationRequest(request.getContent()));

            if (modResponse.isToxic()) {
                // Instantly block and reject the comment
                throw new RuntimeException("Comment blocked by AI Moderator. " + modResponse.getReason());
            }
        } catch (FeignException e) {
            // If the Python server is offline, we'll log it but let the comment through
            // so the app doesn't break if the AI goes down.
            System.out.println("WARNING: AI Moderation offline. Comment allowed.");
        }

        // 3. If it survives the AI, save it to the database
        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setContent(request.getContent());
        comment.setAuthorId(request.getAuthorId());
        Comment saved = commentRepository.save(comment);
        return mapToCommentResponse(saved, request.getAuthorId());
    }

    // --------------------------------------------------------
    // NEW FEATURES: DELETE, REPORT, MODERATE, AND DOWNVOTE
    // --------------------------------------------------------

    // 1. DELETE OWN POST
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        // Security Check: Only the author can delete it (or an admin, but we handle
        // admin delete below)
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

    // --- HELPER METHOD FOR COMMENTS ---
    private CommentResponse mapToCommentResponse(Comment comment, Long userId) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setPostId(comment.getPostId());
        response.setContent(comment.getContent());
        response.setAuthorId(comment.getAuthorId());
        response.setCreatedAt(comment.getCreatedAt());
        response.setParentCommentId(comment.getParentCommentId());
        response.setUpvotes(comment.getUpvotes());
        response.setDownvotes(comment.getDownvotes());
        response.setReplyCount(comment.getReplyCount());

        if (userId != null) {
            response.setUpvoted(commentUpvoteRepository.existsByCommentIdAndUserId(comment.getId(), userId));
            response.setDownvoted(commentDownvoteRepository.existsByCommentIdAndUserId(comment.getId(), userId));
        }

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
    }

    // 6. GET COMMENTS (Top-Level Only)
    public List<CommentResponse> getCommentsForPost(Long postId, Long userId) {
        // Only fetch comments where Parent ID is Null
        List<Comment> comments = commentRepository.findByPostIdAndParentCommentIdIsNullOrderByCreatedAtAsc(postId);
        return comments.stream().map(c -> this.mapToCommentResponse(c, userId)).collect(Collectors.toList());
    }

    // -------------------------------------------------------------
    // PHASE 9: REPLIES & COMMENT VOTING
    // -------------------------------------------------------------

    public CommentResponse addReplyToComment(Long parentCommentId, CommentRequest request) {
        Comment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));

        // AI MODERATION GAUNTLET
        try {
            ModerationClient.ModerationResponse modResponse = moderationClient.checkContent(
                    new ModerationClient.ModerationRequest(request.getContent())
            );
            if (modResponse.isToxic()) {
                throw new RuntimeException("Reply blocked by AI Moderator. " + modResponse.getReason());
            }
        } catch (FeignException e) {
            System.out.println("WARNING: AI Moderation offline. Reply allowed.");
        }

        // SECURITY CHECK: If this is a community post, verify membership
        Post post = postRepository.findById(parentComment.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (post.getCommunityId() != null) {
            if (!communityMemberRepository.existsByCommunityIdAndStudentId(post.getCommunityId(), request.getAuthorId())) {
                throw new RuntimeException("Security Violation: You must be a member of this community to reply.");
            }
        }

        Comment reply = new Comment();
        reply.setPostId(parentComment.getPostId());
        reply.setParentCommentId(parentComment.getId());
        reply.setContent(request.getContent());
        reply.setAuthorId(request.getAuthorId());
        Comment savedReply = commentRepository.save(reply);

        parentComment.setReplyCount(parentComment.getReplyCount() + 1);
        commentRepository.save(parentComment);

        return mapToCommentResponse(savedReply, request.getAuthorId());
    }

    public List<CommentResponse> getRepliesForComment(Long parentCommentId, Long userId) {
        List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(parentCommentId);
        return replies.stream().map(c -> this.mapToCommentResponse(c, userId)).collect(Collectors.toList());
    }

    public CommentResponse upvoteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        commentDownvoteRepository.findByCommentIdAndUserId(commentId, userId).ifPresent(downvote -> {
            commentDownvoteRepository.delete(downvote);
            comment.setDownvotes(Math.max(0, comment.getDownvotes() - 1));
        });

        var existingUpvote = commentUpvoteRepository.findByCommentIdAndUserId(commentId, userId);
        if (existingUpvote.isPresent()) {
            commentUpvoteRepository.delete(existingUpvote.get());
            comment.setUpvotes(Math.max(0, comment.getUpvotes() - 1));
        } else {
            CommentUpvote upvote = new CommentUpvote();
            upvote.setCommentId(commentId);
            upvote.setUserId(userId);
            commentUpvoteRepository.save(upvote);
            comment.setUpvotes(comment.getUpvotes() + 1);
        }
        Comment saved = commentRepository.save(comment);
        return mapToCommentResponse(saved, userId);
    }

    public CommentResponse downvoteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        commentUpvoteRepository.findByCommentIdAndUserId(commentId, userId).ifPresent(upvote -> {
            commentUpvoteRepository.delete(upvote);
            comment.setUpvotes(Math.max(0, comment.getUpvotes() - 1));
        });

        var existingDownvote = commentDownvoteRepository.findByCommentIdAndUserId(commentId, userId);
        if (existingDownvote.isPresent()) {
            commentDownvoteRepository.delete(existingDownvote.get());
            comment.setDownvotes(Math.max(0, comment.getDownvotes() - 1));
        } else {
            CommentDownvote downvote = new CommentDownvote();
            downvote.setCommentId(commentId);
            downvote.setUserId(userId);
            commentDownvoteRepository.save(downvote);
            comment.setDownvotes(comment.getDownvotes() + 1);
        }
        Comment saved = commentRepository.save(comment);
        return mapToCommentResponse(saved, userId);
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthorId().equals(userId)) {
             ApiResponse<UserSummaryDto> userRes = userClient.getUserSummary(userId);
             if (userRes.isSuccess() && userRes.getData() != null) {
                 String role = userRes.getData().getRole();
                 if (!"SUPER_ADMIN".equals(role) && !"COLLEGE_ADMIN".equals(role)) {
                     throw new RuntimeException("Unauthorized: You can only delete your own comments.");
                 }
             } else {
                 throw new RuntimeException("Unauthorized: You can only delete your own comments.");
             }
        }

        commentRepository.delete(comment);
        
        if (comment.getParentCommentId() != null) {
            commentRepository.findById(comment.getParentCommentId()).ifPresent(parent -> {
                parent.setReplyCount(Math.max(0, parent.getReplyCount() - 1));
                commentRepository.save(parent);
            });
        }
    }
}