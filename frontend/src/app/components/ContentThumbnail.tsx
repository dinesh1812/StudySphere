import { Link } from 'react-router';
import { Bookmark, Lock, Users, Globe } from 'lucide-react';

export interface ContentThumbnailProps {
  id: string;
  title: string;
  domain: string;
  subdomain: string;
  topics: string[];
  contentType: 'Article' | 'Discussion' | 'Methodology' | 'Literature Review';
  imageUrl?: string;
  institution: string;
  visibility: 'Public' | 'Institution-Only' | 'Private Project';
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

export function ContentThumbnail({
  id,
  title,
  domain,
  subdomain,
  topics,
  contentType,
  imageUrl,
  institution,
  visibility,
  isBookmarked = false,
  onBookmark,
}: ContentThumbnailProps) {
  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'Public':
        return <Globe className="h-3 w-3" />;
      case 'Institution-Only':
        return <Users className="h-3 w-3" />;
      case 'Private Project':
        return <Lock className="h-3 w-3" />;
    }
  };

  const getContentTypeColor = () => {
    switch (contentType) {
      case 'Article':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Discussion':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Methodology':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Literature Review':
        return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all">
      <Link to={`/content/${id}`} className="block">
        {imageUrl && (
          <div className="aspect-[16/9] bg-muted overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5">
          {/* Content Type Badge */}
          <div className="mb-3">
            <span
              className={`inline-block px-2.5 py-1 text-xs font-medium rounded border ${getContentTypeColor()}`}
            >
              {contentType}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Domain → Subdomain → Topics */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
            <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
              {domain}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
              {subdomain}
            </span>
            {topics.length > 0 && (
              <>
                <span className="text-muted-foreground">→</span>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Institution and Visibility */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{institution}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {getVisibilityIcon()}
                {visibility}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Bookmark Button */}
      <div className="px-5 pb-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            onBookmark?.();
          }}
          className={`flex items-center gap-2 text-sm transition-colors ${
            isBookmarked
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark
            className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
          />
          <span>{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
}
