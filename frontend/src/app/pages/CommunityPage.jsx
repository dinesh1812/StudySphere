import { useState, useEffect } from 'react';
import { communityService } from '@/api/communityService';
import { useNavigate } from 'react-router';
import { Users, Loader2, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function CommunityPage() {
  const [communities, setCommunities] = useState([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commRes, joinedRes] = await Promise.all([
          communityService.getAllCommunities(),
          communityService.getJoinedCommunityIds()
        ]);
        
        if (commRes.success) setCommunities(commRes.data);
        if (joinedRes.success) setJoinedCommunityIds(joinedRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoin = async (communityId) => {
    try {
      const res = await communityService.joinCommunity(communityId);
      if (res.success) {
        toast.success('Successfully joined community!');
        setJoinedCommunityIds([...joinedCommunityIds, communityId]);
      }
    } catch (err) {
      toast.error('Failed to join community');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Communities</h1>
        <p className="text-muted-foreground">
          Join academic communities and collaborate with your peers
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-1">No communities yet</p>
          <p className="text-sm text-muted-foreground">
            Create one from the Workspace page to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {communities.map((community) => (
            <div
              key={community.id}
              className="bg-card border border-border rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{community.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {community.description || 'Academic community'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {joinedCommunityIds.includes(community.id) && (
                  <button
                    onClick={() => navigate(`/community/${community.id}`)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                    title="Open Feed"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleJoin(community.id)}
                  disabled={joinedCommunityIds.includes(community.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    joinedCommunityIds.includes(community.id)
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {joinedCommunityIds.includes(community.id) ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
