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
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Draft Article state
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState({ title: '', content: '' });

  // Create Community State
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [teamData, setTeamData] = useState({ name: '', description: '' });

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
      toast.error('Failed to load active projects');
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

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamData.name || !teamData.description) {
      toast.error('Name and description are required');
      return;
    }

    try {
      setIsSubmittingTeam(true);
      const user = getUser();
      const res = await communityService.createCommunity({
        name: teamData.name,
        description: teamData.description
        // authorId is no longer sent, backend securely extracts it from JWT via X-User-Id
      });
      if (res.success) {
        toast.success("Research Team created!");
        setTeamData({ name: '', description: '' });
        setIsCreatingTeam(false);
        fetchCommunities(); // Refresh list
      }
    } catch (err) {
      toast.error('Failed to create team');
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Research Workspace
          </h1>
          <p className="text-muted-foreground">
            Manage your research teams, projects, and collaborative work
          </p>
        </div>
        <button 
          onClick={() => setIsCreatingTeam(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Team
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => setIsCreatingTeam(true)}
          className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors text-left group"
        >
          <Users className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            + Team
          </h3>
          <p className="text-sm text-muted-foreground">
            Invite collaborators to work together
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

      {/* Active Projects */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Projects / Teams</h2>
        <button onClick={fetchCommunities} className="text-sm text-primary hover:underline">
          Refresh List
        </button>
      </div>

      <div className="space-y-4">
        {isLoadingProjects ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">No active research teams found. Start a project!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <FolderOpen className="h-4 w-4" />
                      Research Network
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      Community Team
                    </span>
                    <span className="flex items-center gap-1.5 line-clamp-1">
                      {project.description}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/community/${project.id}`)}
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                >
                  Open
                </button>
              </div>
            </div>
          ))
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

      {/* Create Team Modal */}
      {isCreatingTeam && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-semibold text-foreground">Create Research Team</h2>
              <button
                onClick={() => setIsCreatingTeam(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTeam} className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamData.name}
                    onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                    placeholder="Enter team name..."
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={teamData.description}
                    onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                    placeholder="Describe your research team's purpose..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingTeam(false)}
                  className="px-6 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTeam}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmittingTeam && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
