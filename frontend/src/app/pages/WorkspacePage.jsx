import { Plus, Users, Lock, FileText, FolderOpen, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { postService } from '@/api/postService';
import { communityService } from '@/api/communityService';
import { getUser } from '@/auth/auth';
import { toast } from 'sonner';

export function WorkspacePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'discover'

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
      // Fetches only JOINED communities
      const res = await communityService.getAllCommunities();
      if (res.success) {
        setProjects(res.data);
      }

      // Pre-fetch discoverable communities
      const discoverRes = await communityService.getBrowseCommunities();
      if (discoverRes.success) {
        const joinedIds = res.data.map(c => c.id);
        setDiscoverCommunities(discoverRes.data.filter(c => !joinedIds.includes(c.id)));
      }
    } catch (err) {
      toast.error('Failed to load communities');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      const res = await communityService.joinCommunity(id);
      if (res.success) {
        toast.success("Joined community!");
        fetchCommunities();
      }
    } catch (err) {
      toast.error("Failed to join");
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
        collegeId: parseInt(user?.collegeId, 10) || 1,
        communityId: null // General Feed
      };

      const res = await postService.createPost(payload);
      if (res.success) {
        toast.success("Article successfully published!");
        setPostData({ title: '', content: '' });
        setIsDrafting(false);
      }
    } catch (err) {
      toast.error('Failed to publish article');
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
      const user = getUser();
      const res = await communityService.createCommunity({
        name: communityData.name,
        description: communityData.description
        // authorId is no longer sent, backend securely extracts it from JWT via X-User-Id
      });
      if (res.success) {
        toast.success("Community created!");
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Workspace Hub
          </h1>
          <p className="text-muted-foreground">
            Manage your communities, projects, and collaborative work
          </p>
        </div>
        <button 
          onClick={() => setIsCreatingCommunity(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Community
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => setIsCreatingCommunity(true)}
          className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors text-left group"
        >
          <Users className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            + Community
          </h3>
          <p className="text-sm text-muted-foreground">
            Create a space for collaborative discussion
          </p>
        </button>

        <button
          onClick={() => setIsDrafting(true)}
          className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors text-left group"
        >
          <FileText className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            + Post
          </h3>
          <p className="text-sm text-muted-foreground">
            Start writing a new research article
          </p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 gap-8">
        <button 
          onClick={() => setActiveTab('my')}
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'my' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          My Communities ({projects.length})
          {activeTab === 'my' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button 
          onClick={() => setActiveTab('discover')}
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'discover' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Discover New ({discoverCommunities.length})
          {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingProjects ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : activeTab === 'my' ? (
          projects.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-card/50 border border-dashed border-border rounded-xl">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No joined communities yet.</p>
              <p className="text-sm text-muted-foreground/60">Check the Discover tab to find research groups!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/community/${project.id}`)}
                className="bg-card border border-border rounded-xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                   <FolderOpen className="h-14 w-14 text-primary absolute -top-4 -right-4 grayscale group-hover:grayscale-0 transition-all rotate-12" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                    {project.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary/60" />
                      Active Community
                    </span>
                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-all font-black">
                      Project Open →
                    </span>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          discoverCommunities.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-card/50 border border-dashed border-border rounded-xl">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No new communities to discover right now.</p>
            </div>
          ) : (
            discoverCommunities.map((project) => (
              <div
                key={project.id}
                className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all border-dashed hover:border-primary/50 flex flex-col"
              >
                <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
                  {project.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-4 flex-1">
                  {project.description}
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleJoin(project.id); }}
                  className="w-full py-3 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-sm font-black rounded-lg transition-all shadow-sm active:scale-95"
                >
                  Join Community
                </button>
              </div>
            ))
          )
        )}
      </div>

      {/* Draft Article Modal */}
      {isDrafting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-semibold text-foreground">Draft New Article</h2>
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                    placeholder="Enter article title..."
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content
                  </label>
                  <textarea
                    value={postData.content}
                    onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                    placeholder="Write your research findings..."
                    rows={12}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsDrafting(false)}
                  className="px-6 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {isCreatingCommunity && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-semibold text-foreground">Create Community</h2>
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={communityData.name}
                    onChange={(e) => setCommunityData({ ...communityData, name: e.target.value })}
                    placeholder="Enter community name..."
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={communityData.description}
                    onChange={(e) => setCommunityData({ ...communityData, description: e.target.value })}
                    placeholder="Describe your community's purpose..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingCommunity(false)}
                  className="px-6 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCommunity}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmittingCommunity && <Loader2 className="h-4 w-4 animate-spin" />}
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
