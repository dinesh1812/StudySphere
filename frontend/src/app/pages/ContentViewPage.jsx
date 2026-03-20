import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { postService } from '@/api/postService';
import { communityService } from '@/api/communityService';
import { getUser } from '@/auth/auth';
import { ArrowLeft, Calendar, User, Loader2, MessageSquare, Send, ArrowBigUp, ArrowBigDown, Flag, Users } from 'lucide-react';
import { ReportModal } from '@/app/components/ReportModal';
import { toast } from 'sonner';

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
        // authorId is securely extracted by backend from the JWT via API Gateway
        content: newComment
      };

      const res = await postService.addComment(payload);
      if (res.success) {
        toast.success("Comment posted!");
        setNewComment('');
        fetchComments(id); // Reload comments
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
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                  {getUser()?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add to the discussion..."
                    className="w-full pl-4 pr-12 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
                    rows={2}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="absolute right-3 bottom-3 p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-medium shrink-0">
                    U
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{comment.authorName || `User ${comment.authorId}`}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
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
