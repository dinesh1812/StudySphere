import { useState, useEffect } from 'react';
import { communityService } from '@/api/communityService';
import { useNavigate } from 'react-router';
import { Users, Loader2, FolderOpen } from 'lucide-react';
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
          communityService.getBrowseCommunities(),
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
        toast.success('Joined!');
        setJoinedCommunityIds([...joinedCommunityIds, communityId]);
      }
    } catch (err) {
      toast.error('Failed to join');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-8">Discover communities</h1>
      
      {isLoading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">No communities found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => {
            const isJoined = joinedCommunityIds.includes(community.id);
            return (
              <div
                key={community.id}
                className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all border-dashed hover:border-primary/50 flex flex-col group relative overflow-hidden"
              >
                 {/* Decorative Accent */}
                 <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                    <FolderOpen className="h-14 w-14 text-primary absolute -top-4 -right-4 grayscale group-hover:grayscale-0 transition-all rotate-12" />
                 </div>

                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                    {community.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-4 flex-1">
                    {community.description || 'Academic research and discussion group.'}
                  </p>
                  <div className="p-4 md:p-6 space-y-3">
                    {isJoined ? (
                      <button 
                        onClick={() => navigate(`/community/${community.id}`)}
                        className="w-full py-2.5 md:py-3 bg-primary text-primary-foreground text-xs md:text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                      >
                        Open
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleJoin(community.id)}
                        className="w-full py-2.5 md:py-3 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-xs md:text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
