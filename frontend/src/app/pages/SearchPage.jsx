import { useState, useEffect } from 'react';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { postService } from '@/api/postService';
import { Search, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [allPosts, setAllPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSearchFeed = async () => {
      try {
        const res = await postService.getGeneralFeed();
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
          setAllPosts(formattedPosts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSearchFeed();
  }, []);

  const handleUpvote = async (id) => {
    try {
      const res = await postService.upvotePost(id);
      if (res.success) {
        setAllPosts(prev => prev.map(post => {
          if (post.id === id.toString()) {
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

  const handleDownvote = async (id) => {
    try {
      const res = await postService.downvotePost(id);
      if (res.success) {
        setAllPosts(prev => prev.map(post => {
          if (post.id === id.toString()) {
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

  // Filter by search query (matches title, author name, content)
  const filteredContent = allPosts.filter((post) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.authorName.toLowerCase().includes(q) ||
      (post.content && post.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-6">
          Search Academic Content
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, author, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {filteredContent.length} result{filteredContent.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContent.map((post) => (
              <ContentThumbnail
                key={post.id}
                {...post}
                onUpvote={() => handleUpvote(post.id)}
                onDownvote={() => handleDownvote(post.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
