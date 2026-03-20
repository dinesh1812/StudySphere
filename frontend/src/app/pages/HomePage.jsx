import { useState, useEffect } from 'react';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { postService } from '@/api/postService';
import { Loader2, Send, PenSquare } from 'lucide-react';
import { getUser } from '@/auth/auth';
import { useUser } from '@/app/context/UserContext';
import { toast } from 'sonner';

export function HomePage() {
  const { userData } = useUser();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getUser();

  // Create Post state
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setIsLoading(true);
      const res = await postService.getGeneralFeed();
      if (res.success) {
        const formattedPosts = res.data.map(post => ({
          id: post.id.toString(),
          title: post.title,
          content: post.content,
          authorName: post.author?.fullName || 'Unknown User',
          authorRole: post.author?.role || 'STUDENT',
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          upvoted: post.upvoted || false,
          downvoted: post.downvoted || false,
          createdAt: post.createdAt,
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      toast.error("Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: newPost.title,
        content: newPost.content,
        collegeId: userData?.collegeId || user?.collegeId || 1,
      };

      const res = await postService.createPost(payload);
      if (res.success) {
        toast.success('Posted!');
        setNewPost({ title: '', content: '' });
        setShowPostForm(false);
        fetchFeed(); // Refresh the feed
      }
    } catch (err) {
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      // VISUAL OPTIMIZATION: Flip state immediately for responsiveness
      setPosts(prev => prev.map(post => {
        if (post.id === id.toString() && post.downvoted) {
          return { ...post, downvoted: false, upvoted: true, upvotes: post.upvotes + 1, downvotes: Math.max(0, post.downvotes - 1) };
        }
        return post;
      }));

      const res = await postService.upvotePost(id);
      if (res.success) {
        setPosts(prev => prev.map(post => {
          if (post.id === id.toString()) {
            return {
              ...post,
              upvotes: res.data.upvotes,
              downvotes: res.data.downvotes,
              upvoted: res.data.upvoted,
              downvoted: res.data.downvoted
            };
          }
          return post;
        }));
      }
    } catch (error) {
      toast.error('Failed to upvote post');
      fetchFeed(); // Rollback/Sync
    }
  };

  const handleDownvote = async (id) => {
    try {
      // VISUAL OPTIMIZATION: Flip state immediately for responsiveness
      setPosts(prev => prev.map(post => {
        if (post.id === id.toString() && post.upvoted) {
          return { ...post, upvoted: false, downvoted: true, upvotes: Math.max(0, post.upvotes - 1), downvotes: post.downvotes + 1 };
        }
        return post;
      }));

      const res = await postService.downvotePost(id);
      if (res.success) {
        setPosts(prev => prev.map(post => {
          if (post.id === id.toString()) {
            return {
              ...post,
              upvotes: res.data.upvotes,
              downvotes: res.data.downvotes,
              upvoted: res.data.upvoted,
              downvoted: res.data.downvoted
            };
          }
          return post;
        }));
      }
    } catch (error) {
      toast.error('Failed to downvote post');
      fetchFeed(); // Rollback/Sync
    }
  };

  const initials = userData?.fullName
    ? userData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Create Post Prompt (LinkedIn-style) */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        {!showPostForm ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              {initials}
            </div>
            <button
              onClick={() => setShowPostForm(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors text-sm"
            >
              Post something...
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreatePost}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{userData?.fullName || 'User'}</p>
                <p className="text-xs text-muted-foreground">Posting to General Feed</p>
              </div>
            </div>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="Title"
              className="w-full px-4 py-2.5 mb-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground font-medium"
            />
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="What do you want to talk about?"
              rows={4}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none text-sm"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => { setShowPostForm(false); setNewPost({ title: '', content: '' }); }}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Post
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <PenSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-1">No posts yet</p>
          <p className="text-sm text-muted-foreground">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <ContentThumbnail
              key={post.id}
              {...post}
              onUpvote={() => handleUpvote(post.id)}
              onDownvote={() => handleDownvote(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
