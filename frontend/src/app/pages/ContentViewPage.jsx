import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { postService } from '@/api/postService';
import { communityService } from '@/api/communityService';
import { getUser } from '@/auth/auth';
import { ArrowLeft, Calendar, User, Loader2, MessageSquare, Send, ArrowBigUp, ArrowBigDown, Flag, Users } from 'lucide-react';
import { ReportModal } from '@/app/components/ReportModal';
import { toast } from 'sonner';

function CommentItem({ comment, onReplyCreated }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [commentData, setCommentData] = useState(comment);

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0 && commentData.replyCount > 0) {
      try {
        setIsLoadingReplies(true);
        const res = await postService.getReplies(commentData.id);
        if (res.success) setReplies(res.data);
      } catch (err) {
        toast.error("Failed to load replies");
      } finally {
        setIsLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setIsSubmittingReply(true);
      const res = await postService.addReply(commentData.id, { content: replyText });
      if (res.success) {
        toast.success("Reply posted!");
        setReplyText('');
        setIsReplying(false);
        // Refresh replies if they are already shown, otherwise just expand and show
        if (showReplies) {
          const freshReplies = await postService.getReplies(commentData.id);
          if (freshReplies.success) setReplies(freshReplies.data);
        } else {
          try {
            setIsLoadingReplies(true);
            const freshReplies = await postService.getReplies(commentData.id);
            if (freshReplies.success) {
              setReplies(freshReplies.data);
              setShowReplies(true);
            }
          } catch (err) {
            console.error("Failed to load new replies", err);
          } finally {
            setIsLoadingReplies(false);
          }
        }
        setCommentData(prev => ({ ...prev, replyCount: prev.replyCount + 1 }));
      }
    } catch (err) {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleVote = async (type) => {
    try {
      const res = type === 'up' 
        ? await postService.upvoteComment(commentData.id)
        : await postService.downvoteComment(commentData.id);
      if (res.success) {
        setCommentData(prev => ({
          ...prev,
          upvotes: res.data.upvotes,
          downvotes: res.data.downvotes,
          upvoted: res.data.upvoted,
          downvoted: res.data.downvoted
        }));
      }
    } catch (err) {
      toast.error(`Failed to ${type}vote comment`);
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div className={`flex flex-col gap-2 ${commentData.parentCommentId ? 'pl-6 ml-2 border-l border-border/40 mt-3' : 'py-6 border-b border-border/50'}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-[10px] font-bold text-secondary-foreground shrink-0 border border-border/50 shadow-sm">
          {(commentData.authorName || 'U').charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Metadata */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-foreground hover:underline cursor-pointer">
              {commentData.authorName || `User ${commentData.authorId}`}
            </span>
            <span className="text-[10px] text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded">
              {formatDateShort(commentData.createdAt)}
            </span>
          </div>
          
          {/* Content */}
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {commentData.content}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center bg-secondary/30 hover:bg-secondary/50 rounded-full px-1.5 py-0.5 border border-border/40 transition-colors">
                <button 
                  onClick={() => handleVote('up')} 
                  className={`p-0.5 transition-all active:scale-125 ${commentData.upvoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                    <ArrowBigUp className={`h-4 w-4 ${commentData.upvoted ? 'fill-current' : ''}`} />
                </button>
                <span className={`text-[10px] font-black min-w-[1.2rem] text-center ${commentData.upvoted ? 'text-primary' : commentData.downvoted ? 'text-destructive' : 'text-foreground'}`}>
                  {commentData.upvotes - commentData.downvotes}
                </span>
                <button 
                  onClick={() => handleVote('down')} 
                  className={`p-0.5 transition-all active:scale-125 ${commentData.downvoted ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                >
                    <ArrowBigDown className={`h-4 w-4 ${commentData.downvoted ? 'fill-current' : ''}`} />
                </button>
             </div>

             <button 
                onClick={() => setIsReplying(!isReplying)}
                className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${isReplying ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
             >
                <MessageSquare className="h-3 w-3" />
                <span>Reply</span>
             </button>

             {commentData.replyCount > 0 && (
                <button 
                    onClick={toggleReplies}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 group"
                >
                  <Users className="h-3 w-3" />
                  <span className="group-hover:underline">
                    {showReplies ? 'Collapse' : `${commentData.replyCount} replies`}
                  </span>
                </button>
             )}
          </div>

          {/* Reply Input Form */}
          {isReplying && (
             <form onSubmit={handleReplySubmit} className="mt-4 flex flex-col gap-2 max-w-lg">
                <textarea 
                    autoFocus
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full text-xs p-3 bg-secondary/20 border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px] max-h-[150px] resize-none placeholder:text-muted-foreground"
                />
                <div className="flex justify-end gap-2">
                  <button 
                      type="button"
                      onClick={() => setIsReplying(false)}
                      className="px-3 py-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                      Cancel
                  </button>
                  <button 
                      type="submit"
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                      {isSubmittingReply ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          <span>Post Reply</span>
                        </>
                      )}
                  </button>
                </div>
             </form>
          )}

          {/* Nested Content - Replies */}
          {showReplies && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {isLoadingReplies ? (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground ml-6 py-4">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Loading replies...</span>
                    </div>
                ) : (
                    <div className="space-y-1">
                      {replies.map(reply => (
                          <CommentItem key={reply.id} comment={reply} onReplyCreated={() => {}} />
                      ))}
                    </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContentViewPage() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isDownvoting, setIsDownvoting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [communityName, setCommunityName] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await postService.getPost(id);
        if (res.success) {
          const post = res.data;
          setContent({
            id: post.id.toString(),
            title: post.title,
            contentBody: post.content,
            authorName: post.author?.fullName || 'Unknown User',
            authorRole: post.author?.role || 'STUDENT',
            authorId: post.author?.id,
            collegeId: post.collegeId,
            communityId: post.communityId,
            upvotes: post.upvotes || 0,
            downvotes: post.downvotes || 0,
            upvoted: post.upvoted || false,
            downvoted: post.downvoted || false,
            createdAt: post.createdAt,
          });
          fetchComments(post.id);
          
          if (post.communityId) {
            fetchCommunityName(post.communityId);
          }
        }
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const fetchComments = async (postId) => {
    try {
      const res = await postService.getComments(postId);
      if (res.success) {
        setComments(res.data);
      }
    } catch (err) {
      console.error("Failed to load comments");
    }
  };

  const fetchCommunityName = async (communityId) => {
    try {
      const res = await communityService.getAllCommunities();
      if (res.success) {
        const comm = res.data.find(c => c.id === communityId);
        if (comm) setCommunityName(comm.name);
      }
    } catch (err) {
      console.error("Failed to load community name");
    }
  };

  const handleUpvote = async () => {
    if (!content) return;
    try {
      setIsUpvoting(true);
      const res = await postService.upvotePost(content.id);
      if (res.success) {
        setContent(prev => ({
          ...prev,
          upvotes: res.data.upvotes,
          downvotes: res.data.downvotes,
          upvoted: res.data.upvoted,
          downvoted: res.data.downvoted
        }));
      }
    } catch (error) {
      toast.error('Failed to upvote post');
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDownvote = async () => {
    if (!content) return;
    try {
      setIsDownvoting(true);
      const res = await postService.downvotePost(content.id);
      if (res.success) {
        setContent(prev => ({
          ...prev,
          upvotes: res.data.upvotes,
          downvotes: res.data.downvotes,
          upvoted: res.data.upvoted,
          downvoted: res.data.downvoted
        }));
      }
    } catch (error) {
      toast.error('Failed to downvote post');
    } finally {
      setIsDownvoting(false);
    }
  };

  const handleReport = async (reason) => {
    try {
      setIsReporting(true);
      const res = await postService.reportPost(content.id, reason);
      if (res.success) {
        toast.success("Post reported to college admins.");
        setShowReportModal(false);
      }
    } catch (error) {
      toast.error('Failed to report post');
    } finally {
      setIsReporting(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const payload = {
        postId: parseInt(id, 10),
        content: newComment
      };

      const res = await postService.addComment(payload);
      if (res.success) {
        toast.success("Comment posted!");
        setNewComment('');
        fetchComments(id);
      }
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Content not found</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      {/* Main Content */}
      <article className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-semibold text-foreground mb-6">
            {content.title}
          </h1>

          {/* Author & Metadata */}
          <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border text-sm">
            <Link 
              to={`/profile/${content.authorId}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <User className="h-4 w-4" />
              <span>{content.authorName}</span>
              <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                {content.authorRole === 'COLLEGE_ADMIN' ? 'Admin' : 'Student'}
              </span>
            </Link>
            {content.createdAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(content.createdAt)}</span>
              </div>
            )}
            <div className="flex bg-secondary/30 rounded-full px-2 py-1 items-center gap-1 border border-border">
              <button 
                onClick={handleUpvote}
                disabled={isUpvoting || isDownvoting}
                className={`p-1 transition-all hover:bg-primary/20 rounded-md ${content.upvoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <ArrowBigUp className={`h-6 w-6 ${content.upvoted ? 'fill-current scale-110' : ''}`} />
              </button>
              <span className={`text-sm font-bold min-w-[1.5rem] text-center ${content.upvoted ? 'text-primary' : content.downvoted ? 'text-destructive' : 'text-foreground'}`}>
                {content.upvotes - content.downvotes}
              </span>
              <button 
                onClick={handleDownvote}
                disabled={isUpvoting || isDownvoting}
                className={`p-1 transition-all hover:bg-destructive/20 rounded-md ${content.downvoted ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
              >
                <ArrowBigDown className={`h-6 w-6 ${content.downvoted ? 'fill-current scale-110' : ''}`} />
              </button>
            </div>
            
            <button 
              onClick={() => setShowReportModal(true)}
              disabled={isReporting}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors text-xs font-medium"
            >
              <Flag className="h-4 w-4" />
              <span>Report Content</span>
            </button>
            <div className="text-xs text-muted-foreground">
              College #{content.collegeId}
            </div>
            {communityName && (
              <Link 
                to={`/community/${content.communityId}`}
                className="flex items-center gap-2 text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
              >
                <Users className="h-3 w-3" />
                <span>In Community: {communityName}</span>
              </Link>
            )}
          </div>

          {/* Content Body */}
          <div className="prose max-w-none my-8">
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {content.contentBody}
            </p>
          </div>

          {/* Comments Section */}
          <div className="border-t border-border pt-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Discussions ({comments.length})</h2>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0 shadow-sm border border-primary/20">
                  {getUser()?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add to the discussion..."
                    className="w-full pl-4 pr-12 py-3 border border-border rounded-xl bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground resize-none"
                    rows={2}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="absolute right-3 shadow-md bottom-3 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </form>

            {/* Comment List */}
            <div className="divide-y divide-border/30">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onReplyCreated={() => {}} />
              ))}
              {comments.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8 bg-secondary/5 rounded-lg border border-dashed border-border/50">
                  No comments yet. Be the first to start the discussion!
                </p>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onConfirm={handleReport}
        isSubmitting={isReporting}
      />
    </div>
  );
}
