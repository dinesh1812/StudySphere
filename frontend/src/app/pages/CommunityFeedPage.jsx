import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { postService } from '@/api/postService';
import { communityService } from '@/api/communityService';
import { Loader2, Send, PenSquare, ArrowLeft, LogOut, Users } from 'lucide-react';
import { getUser } from '@/auth/auth';
import { toast } from 'sonner';

export function CommunityFeedPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  // Create Post state
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCommunityDetails();
    fetchFeed();
  }, [id]);

  const fetchCommunityDetails = async () => {
    try {
      const res = await communityService.getAllCommunities();
      if (res.success) {
        setCommunities(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentCommunity = communities.find(c => c.id.toString() === id);

  const fetchFeed = async () => {
    try {
      setIsLoading(true);
      const res = await postService.getCommunityFeed(id);
      if (res.success) {
        const formattedPosts = res.data.map(post => ({
          id: post.id.toString(),
          title: post.title,
          content: post.content,
          authorName: post.author?.fullName || 'Unknown User',
          authorRole: post.author?.role || 'STUDENT',
          upvotes: post.upvotes || 0,
          upvoted: post.upvoted || false,
          createdAt: post.createdAt,
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      toast.error("Failed to load community feed");
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
        collegeId: user?.collegeId || 1,
        communityId: parseInt(id, 10)
      };

      const res = await postService.createPost(payload);
      if (res.success) {
        toast.success('Post published to community!');
        setNewPost({ title: '', content: '' });
        setShowPostForm(false);
        fetchFeed();
      }
    } catch (err) {
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const res = await postService.upvotePost(postId);
      if (res.success) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId.toString()) {
            return {
              ...post,
              upvotes: res.data.upvotes,
              upvoted: res.data.upvoted
            };
          }
          return post;
        }));
      }
    } catch (error) {
      toast.error('Failed to upvote post');
    }
  };

  const handleLeaveCommunity = async () => {
    if (!window.confirm("Are you sure you want to leave this research team?")) return;
    
    try {
      setIsLeaving(true);
      const res = await communityService.leaveCommunity(id);
      if (res.success) {
        toast.success("You have left the community");
        navigate('/workspace');
      }
    } catch (err) {
      toast.error("Failed to leave community");
    } finally {
      setIsLeaving(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {currentCommunity ? currentCommunity.name : 'Community Feed'}
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
              {currentCommunity ? currentCommunity.description : 'Collaborative research and discussion'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLeaveCommunity}
          disabled={isLeaving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-destructive/20"
        >
          {isLeaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Leave Team
        </button>
      </div>

      {/* Create Post Prompt */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        {!showPostForm ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              {initials}
            </div>
            <button
              onClick={() => setShowPostForm(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors text-sm"
            >
              Share something with the team...
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreatePost}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user?.fullName || 'User'}</p>
                <p className="text-xs text-muted-foreground">Posting to {currentCommunity?.name || 'Community'}</p>
              </div>
            </div>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="Thesis or Discussion Topic"
              className="w-full px-4 py-2.5 mb-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground font-medium"
            />
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="What research or ideas would you like to share?"
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
                Share
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
        <div className="text-center py-16 bg-card border border-border rounded-xl shadow-sm">
          <PenSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-1">No research shared here yet</p>
          <p className="text-sm text-muted-foreground">Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <ContentThumbnail
              key={post.id}
              {...post}
              isBookmarked={post.upvoted}
              onBookmark={() => handleUpvote(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
