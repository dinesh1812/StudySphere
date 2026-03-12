import { useState, useEffect } from 'react';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { postService } from '@/api/postService';
import { adminService } from '@/api/adminService';
import { Building2, Loader2 } from 'lucide-react';
import { getUser } from '@/auth/auth';
import { toast } from 'sonner';

export function InstitutionPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collegeName, setCollegeName] = useState('');
  const user = getUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch college name
        const collegesRes = await adminService.getAllColleges();
        if (collegesRes.success) {
          const myCollege = collegesRes.data.find(c => c.id === user?.collegeId);
          if (myCollege) setCollegeName(myCollege.name);
        }

        // Fetch posts
        const res = await postService.getGeneralFeed();
        if (res.success) {
          const myCollegeId = user?.collegeId;
          const collegePosts = myCollegeId
            ? res.data.filter(post => post.collegeId === myCollegeId)
            : res.data;

          const formattedPosts = collegePosts.map(post => ({
            id: post.id.toString(),
            title: post.title,
            content: post.content,
            authorName: post.author?.fullName || 'Unknown User',
            authorRole: post.author?.role || 'STUDENT',
            upvotes: post.upvotes || 0,
            upvoted: post.upvoted || false,
            createdAt: post.createdAt,
          }));
          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpvote = async (id) => {
    try {
      const res = await postService.upvotePost(id);
      if (res.success) {
        // Live update: Update the specific post in the array
        setPosts(prev => prev.map(post => {
          if (post.id === id.toString()) {
            return {
              ...post,
              upvotes: res.data.upvotes,
              upvoted: res.data.upvoted
            };
          }
          return post;
        }));
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
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {collegeName || 'Your Institution'}
            </h1>
            <p className="text-muted-foreground mb-2">
              Academic content shared within your college community
            </p>
          </div>
        </div>
      </div>

      {/* Institution-Exclusive Content */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Institutional Research
        </h2>
        <p className="text-muted-foreground text-sm">
          {posts.length} post{posts.length !== 1 ? 's' : ''} from {collegeName || 'your institution'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">
            No institutional content available at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <ContentThumbnail
              key={post.id}
              {...post}
              isBookmarked={post.upvoted}
              onBookmark={() => handleUpvote(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
