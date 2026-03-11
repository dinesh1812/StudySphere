import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { postService } from '@/api/postService';
import { getUser } from '@/auth/auth';
import { ArrowLeft, Building2, Calendar, User, Globe, Users, Lock, Loader2, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

export function ContentViewPage() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await postService.getGeneralFeed();
        if (res.success) {
          const post = res.data.find(p => p.id.toString() === id);
          if (post) {
            setContent({
              id: post.id.toString(),
              title: post.title,
              contentBody: post.content,
              domain: 'Computer Science',
              subdomain: 'General',
              topics: ['Learning'],
              contentType: 'Article',
              institution: `College ID: ${post.collegeId}`,
              visibility: 'Public',
              imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
              createdAt: post.createdAt,
              authorId: post.authorId
            });
            fetchComments(post.id);
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

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const user = getUser();
      const payload = {
        postId: parseInt(id, 10),
        authorId: parseInt(user?.id, 10) || 1,
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

  const getVisibilityIcon = () => {
    switch (content.visibility) {
      case 'Public':
        return <Globe className="h-4 w-4" />;
      case 'Institution-Only':
        return <Users className="h-4 w-4" />;
      case 'Private Project':
        return <Lock className="h-4 w-4" />;
    }
  };

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
        {/* Header Image */}
        {content.imageUrl && (
          <div className="aspect-[21/9] bg-muted overflow-hidden">
            <img
              src={content.imageUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Metadata Section */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="inline-block px-3 py-1.5 text-sm font-medium rounded border bg-blue-100 text-blue-700 border-blue-200">
                {content.contentType}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {getVisibilityIcon()}
                {content.visibility}
              </span>
            </div>

            <h1 className="text-4xl font-semibold text-foreground mb-6">
              {content.title}
            </h1>

            {/* Taxonomy */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md font-medium">
                {content.domain}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md font-medium">
                {content.subdomain}
              </span>
              {content.topics.length > 0 && (
                <>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex flex-wrap gap-2">
                    {content.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-accent text-accent-foreground text-sm rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Author & Institution */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{content.institution}</span>
              </div>
              <Link 
                to={`/profile/${content.authorId}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Author ID: {content.authorId}</span>
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>January 15, 2026</span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="prose max-w-none mb-12 border-b border-border pb-8">
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {content.contentBody}
            </p>
          </div>

          {/* Comments Section */}
          <div>
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
                      <span className="font-medium text-foreground">User {comment.authorId}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
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
    </div>
  );
}
