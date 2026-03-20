import { Plus, Users, Lock, FileText, FolderOpen, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { postService } from '@/api/postService';
import { communityService } from '@/api/communityService';
import { getUser } from '@/auth/auth';
import { useUser } from '@/app/context/UserContext';
import { toast } from 'sonner';

export function WorkspacePage() {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Draft Article state
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState({ title: '', content: '' });

  // Create Community State
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [isSubmittingCommunity, setIsSubmittingCommunity] = useState(false);
  const [communityData, setCommunityData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setIsLoadingProjects(true);
      const res = await communityService.getAllCommunities();
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      toast.error('Failed to load communities');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postData.title || !postData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = getUser();
      
      const payload = {
        title: postData.title,
        content: postData.content,
        // authorId is no longer sent, backend securely extracts it from JWT via X-User-Id
        collegeId: userData?.collegeId || user?.collegeId || 1,
        communityId: null // General Feed
      };

      const res = await postService.createPost(payload);
      if (res.success) {
        toast.success("Posted!");
        setPostData({ title: '', content: '' });
        setIsDrafting(false);
      }
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!communityData.name || !communityData.description) {
      toast.error('Name and description are required');
      return;
    }

    try {
      setIsSubmittingCommunity(true);
      const res = await communityService.createCommunity({
        name: communityData.name,
        description: communityData.description
        // authorId is no longer sent, backend securely extracts it from JWT via X-User-Id
      });
      if (res.success) {
        toast.success("Created!");
        setCommunityData({ name: '', description: '' });
        setIsCreatingCommunity(false);
        fetchCommunities(); // Refresh list
      }
    } catch (err) {
      toast.error('Failed to create community');
    } finally {
      setIsSubmittingCommunity(false);
    }
  };

  const ownedCommunities = projects.filter(c => c.createdBy === userData?.id);
  const joinedCommunities = projects.filter(c => c.createdBy !== userData?.id);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1 flex items-center gap-2 md:gap-3">
            <FolderOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Workspace
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Manage your research groups and published findings</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsCreatingCommunity(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-secondary text-foreground rounded-xl font-semibold text-xs md:text-sm hover:bg-secondary/80 transition-all active:scale-95 border border-border"
          >
            <Users className="h-4 w-4" />
            New
          </button>
          <button
            onClick={() => setIsDrafting(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-xs md:text-sm hover:bg-primary/90 transition-all shadow-lg active:scale-95 shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Post
          </button>
        </div>
      </div>

      {isLoadingProjects ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Section: My Communities (Owned) */}
          <section className="space-y-6">
          <div className="flex items-center gap-3 p-5 md:p-6 border-b border-border bg-muted/5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-semibold text-foreground truncate">My Communities</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Created by you</p>
              </div>
              <span className="hidden sm:block text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                {ownedCommunities.length}
              </span>
            </div>

            {ownedCommunities.length === 0 ? (
              <div className="bg-card/50 border border-border border-dashed rounded-2xl p-12 text-center group hover:border-primary/30 transition-all">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20 group-hover:opacity-40 transition-opacity" />
                <p className="text-muted-foreground text-sm font-medium mb-4">You haven't created any communities yet.</p>
                <button
                  onClick={() => setIsCreatingCommunity(true)}
                  className="text-primary text-sm font-bold hover:underline underline-offset-4"
                >
                  Create your first community
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {ownedCommunities.map((community) => (
                  <div
                    key={community.id}
                    onClick={() => navigate(`/community/${community.id}`)}
                    className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50" />
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                        {community.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">{community.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 font-medium italic opacity-70">
                          {community.description || 'Lead researcher'}
                        </p>
                      </div>
                    </div>
                    <FolderOpen className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Joined Communities */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 p-5 md:p-6 border-b border-border bg-muted/5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Joined</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Participating in</p>
              </div>
              <span className="hidden sm:block text-[10px] font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full uppercase tracking-wider">
                {joinedCommunities.length}
              </span>
            </div>

            {joinedCommunities.length === 0 ? (
              <div className="bg-card/50 border border-border border-dashed rounded-2xl p-12 text-center group hover:border-border/60 transition-all">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20 group-hover:opacity-40 transition-opacity" />
                <p className="text-muted-foreground text-sm font-medium mb-4">You haven't joined any communities yet.</p>
                <button
                  onClick={() => navigate('/community')}
                  className="text-primary text-sm font-bold hover:underline underline-offset-4"
                >
                  Explore and join one
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {joinedCommunities.map((community) => (
                  <div
                    key={community.id}
                    onClick={() => navigate(`/community/${community.id}`)}
                    className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                        {community.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">{community.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 font-medium tracking-tight overflow-hidden text-ellipsis max-w-[220px]">
                          {community.description || 'Researcher'}
                        </p>
                      </div>
                    </div>
                    <FolderOpen className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Draft Article Modal */}
      {isDrafting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Draft New Article</h2>
              <button
                onClick={() => setIsDrafting(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                    placeholder="Enter article title..."
                    className="w-full px-4 py-3 border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Content
                  </label>
                  <textarea
                    value={postData.content}
                    onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                    placeholder="Write your research findings..."
                    rows={12}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none text-sm leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsDrafting(false)}
                  className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-foreground font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {isCreatingCommunity && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Create Community</h2>
              <button
                onClick={() => setIsCreatingCommunity(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCommunity} className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={communityData.name}
                    onChange={(e) => setCommunityData({ ...communityData, name: e.target.value })}
                    placeholder="e.g. Quantum Computing Research"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={communityData.description}
                    onChange={(e) => setCommunityData({ ...communityData, description: e.target.value })}
                    placeholder="Describe your community's purpose..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none text-sm leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingCommunity(false)}
                  className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-foreground font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCommunity}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isSubmittingCommunity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}