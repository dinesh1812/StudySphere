import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Flag, Check, Trash2, Loader2, RefreshCw, User, Search } from 'lucide-react';
import { adminService } from '@/api/adminService';
import { toast } from 'sonner';

export function ModerationPage() {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModeratingId, setIsModeratingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFlaggedPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getModerationDashboard();
      if (res.success) {
        setFlaggedPosts(res.data);
      } else {
        toast.error('Could not fetch flagged posts: ' + res.message);
      }
    } catch (error) {
      toast.error('Failed to load moderation dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlaggedPosts();
  }, [fetchFlaggedPosts]);

  const handleModeratePost = async (postId, action) => {
    const confirmMsg = action === 'REMOVE' 
      ? 'Are you sure you want to PERMANENTLY DELETE this post?' 
      : 'Approve post and clear all flags?';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsModeratingId(postId);
      const res = await adminService.resolveModeratedPost(postId, action);
      if (res.success) {
        toast.success(action === 'REMOVE' ? 'Post deleted successfully.' : 'Post approved and flags cleared.');
        setFlaggedPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        toast.error(res.message || 'Moderation action failed.');
      }
    } catch (error) {
      toast.error('An error occurred during moderation');
    } finally {
      setIsModeratingId(null);
    }
  };

  const filteredPosts = flaggedPosts.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) || 
      post.author?.fullName?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            Content Moderation
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and resolve reported posts from your student community.
          </p>
        </div>
        <button
          onClick={fetchFlaggedPosts}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, or content..."
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        />
      </div>

      {/* Grid of Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Scanning for flagged content...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border border-dashed rounded-2xl">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">All Clear!</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            {searchQuery ? "No flagged posts match your search criteria." : "No posts have been reported in your college yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col group border-l-4 border-l-destructive/30">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Flag className="h-3 w-3" />
                    {post.reportCount} Reports
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    ID: {post.id}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 bg-secondary/20 p-3 rounded-lg border border-border/50 italic">
                  "{post.content}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {post.author?.fullName || 'Anonymous User'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Student ID: {post.author?.studentId || post.author?.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex border-t border-border divide-x divide-border">
                <button
                  onClick={() => handleModeratePost(post.id, 'APPROVE')}
                  disabled={isModeratingId === post.id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {isModeratingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Allow Post
                </button>
                <button
                  onClick={() => handleModeratePost(post.id, 'REMOVE')}
                  disabled={isModeratingId === post.id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
                >
                  {isModeratingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Remove Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
