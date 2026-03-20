import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { postService } from '@/api/postService';
import { communityService } from '@/api/communityService';
import { Loader2, Send, PenSquare, ArrowLeft, LogOut, Users, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/app/components/ConfirmModal';
import { getUser } from '@/auth/auth';
import { useUser } from '@/app/context/UserContext';
import { toast } from 'sonner';

export function CommunityFeedPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  const user = getUser();
  
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Modal States
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

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
      const res = await communityService.getBrowseCommunities(); // Get all to find our current one
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
          downvotes: post.downvotes || 0,
          upvoted: post.upvoted || false,
          downvoted: post.downvoted || false,
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
        collegeId: userData?.collegeId || user?.collegeId || 1,
        communityId: parseInt(id, 10)
      };

      const res = await postService.createPost(payload);
      if (res.success) {
        toast.success('Posted!');
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
    }
  };

  const handleDownvote = async (postId) => {
    try {
      const res = await postService.downvotePost(postId);
      if (res.success) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId.toString()) {
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
    }
  };

  const handleLeaveCommunity = async () => {
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

  const handleDeleteCommunity = async () => {
    try {
      setIsDeleting(true);
      const res = await communityService.deleteCommunity(id);
      if (res.success) {
        toast.success("Community deleted permanently");
        navigate('/workspace');
      }
    } catch (err) {
      toast.error("Failed to delete community");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const res = await communityService.getMembers(id);
      if (res.success) {
        setMembers(res.data);
      }
    } catch (err) {
      toast.error("Failed to load members");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      const res = await communityService.removeMember(id, memberToRemove);
      if (res.success) {
        toast.success("Member removed");
        fetchMembers(); // Refresh list
      }
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setMemberToRemove(null);
    }
  };

  useEffect(() => {
    if (showMembersModal) {
      fetchMembers();
    }
  }, [showMembersModal]);

  const initials = userData?.fullName
    ? userData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
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
        <div className="flex items-center gap-2">
          {currentCommunity?.createdBy === user?.id ? (
            <>
              <button
                onClick={() => setShowMembersModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors border border-border"
              >
                <Users className="h-4 w-4" />
                Manage Members
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-destructive/20"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Community
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              disabled={isLeaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-destructive/20"
            >
              {isLeaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Leave Team
            </button>
          )}
        </div>
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
              Share with the community...
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
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
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
              onUpvote={() => handleUpvote(post.id)}
              onDownvote={() => handleDownvote(post.id)}
            />
          ))}
        </div>
      )}
      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community Members
              </h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                title="Close"
              >
                <LogOut className="h-5 w-5 text-muted-foreground rotate-180" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {isLoadingMembers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No members found.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {member.studentId === currentCommunity?.createdBy ? '👑' : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">User ID: {member.studentId}</p>
                        <p className="text-[10px] text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {member.studentId !== user?.id && (
                      <button
                        onClick={() => {
                          setMemberToRemove(member.studentId);
                          setShowRemoveMemberConfirm(true);
                        }}
                        className="text-xs font-bold text-destructive hover:underline px-2 py-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveCommunity}
        title="Leave Community?"
        message="Are you sure you want to exit this research community? You will no longer be able to participate in discussions."
        confirmText="Leave Community"
        variant="destructive"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCommunity}
        title="Delete Community Permanently?"
        message="CRITICAL: This action will erase all posts, comments, and member data associated with this community. This cannot be undone."
        confirmText="Delete Everything"
        variant="destructive"
      />

      <ConfirmModal
        isOpen={showRemoveMemberConfirm}
        onClose={() => {
          setShowRemoveMemberConfirm(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleRemoveMember}
        title="Remove Member?"
        message={`Are you sure you want to remove user ${memberToRemove} from the community?`}
        confirmText="Remove Student"
        variant="destructive"
      />
    </div>
  );
}
