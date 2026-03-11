import { useState, useEffect } from 'react';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { postService } from '@/api/postService';
import { BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function HomePage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setIsLoading(true);
      const res = await postService.getGeneralFeed();
      if (res.success) {
        // Map backend Post model to match ContentThumbnail expectations
        const formattedPosts = res.data.map(post => ({
          id: post.id.toString(),
          title: post.title,
          domain: 'Computer Science', // Mock fallback
          subdomain: 'General', // Mock fallback
          topics: ['Learning'], // Mock fallback
          contentType: 'Article',
          institution: `College ID: ${post.collegeId}`,
          visibility: 'Public',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop', // Fallback image
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      toast.error("Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Academic Feed
        </h1>
        <p className="text-muted-foreground">
          Personalized content based on your academic interests and activity
        </p>
      </div>

      {/* Interest Tags */}
      <div className="mb-8 p-5 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Your Interests</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Machine Learning', 'Climate Science', 'Quantum Computing', 'Biomedical Engineering', 'Ethics'].map(
            (interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-full border border-border"
              >
                {interest}
              </span>
            )
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span className="text-sm">
            {posts.length} research contributions
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
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
      )}
    </div>
  );
}
