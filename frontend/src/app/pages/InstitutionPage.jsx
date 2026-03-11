import { useState, useEffect } from 'react';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { postService } from '@/api/postService';
import { Building2, Shield, Users, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function InstitutionPage() {
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutionPosts = async () => {
      try {
        const res = await postService.getGeneralFeed();
        if (res.success) {
          const formattedPosts = res.data.map(post => ({
            id: post.id.toString(),
            title: post.title,
            domain: 'Computer Science',
            subdomain: 'General',
            topics: ['Learning'],
            contentType: 'Article',
            institution: `College ID: ${post.collegeId}`,
            visibility: 'Institution-Only', // Faked for UI until backend supports it
            imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
          }));
          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstitutionPosts();
  }, []);

  const handleBookmark = async (id) => {
    try {
      const res = await postService.upvotePost(id);
      if (res.success) {
        setBookmarkedIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
        });
      }
    } catch (error) {
      toast.error('Failed to upvote post');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Institution Header */}
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-primary text-primary-foreground rounded-lg">
            <Building2 className="h-12 w-12" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold text-foreground">
                R.M.K Group of Institutions
              </h1>
              <Shield className="h-6 w-6 text-primary" title="Verified Institution" />
            </div>
            <p className="text-muted-foreground mb-6">
               From cutting-edge to leading edge, RMK offers an ever adapting and dynamic learning process across all its institutions. A highly qualified faculty, across disciplines Uniform class size and student-to-faculty ratio Facilitating healthy student-teacher interactions and learning partnerships...
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">1450</div>
                  <div className="text-xs text-muted-foreground">Members</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">234</div>
                  <div className="text-xs text-muted-foreground">Publications</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">30</div>
                  <div className="text-xs text-muted-foreground">Departments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Institution-Exclusive Content */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Institutional Research
        </h2>
        <p className="text-muted-foreground">
          Academic content shared within the RMK community
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((content) => (
              <ContentThumbnail
                key={content.id}
                {...content}
                isBookmarked={bookmarkedIds.has(content.id)}
                onBookmark={() => handleBookmark(content.id)}
              />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">
                No institutional content available at this time.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
