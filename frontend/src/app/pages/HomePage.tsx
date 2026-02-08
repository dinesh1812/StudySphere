import { useState } from 'react';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { mockContent } from '@/app/data/mockContent';
import { BookOpen, TrendingUp } from 'lucide-react';

export function HomePage() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const handleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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
            {mockContent.length} research contributions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockContent.map((content) => (
          <ContentThumbnail
            key={content.id}
            {...content}
            isBookmarked={bookmarkedIds.has(content.id)}
            onBookmark={() => handleBookmark(content.id)}
          />
        ))}
      </div>
    </div>
  );
}
