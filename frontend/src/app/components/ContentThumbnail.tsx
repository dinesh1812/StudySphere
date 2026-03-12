import { Link } from 'react-router';
import { Bookmark, User, ThumbsUp, Calendar } from 'lucide-react';

export interface ContentThumbnailProps {
  id: string;
  title: string;
  content?: string;
  authorName: string;
  authorRole?: string;
  upvotes: number;
  createdAt?: string;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

export function ContentThumbnail({
  id,
  title,
  content,
  authorName,
  authorRole,
  upvotes,
  createdAt,
  isBookmarked = false,
  onBookmark,
}: ContentThumbnailProps) {

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  // Generate a consistent color based on the author name
  const getAvatarColor = () => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
    ];
    const hash = (authorName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const initials = authorName
    ? authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const snippet = content && content.length > 120 ? content.substring(0, 120) + '...' : content;

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all">
      <Link to={`/content/${id}`} className="block">
        <div className="p-5">
          {/* Author Row */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full ${getAvatarColor()} text-white flex items-center justify-center text-xs font-bold`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{authorName}</p>
              <p className="text-xs text-muted-foreground">
                {authorRole === 'COLLEGE_ADMIN' ? 'College Admin' : 'Student'}
              </p>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Content Snippet */}
          {snippet && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {snippet}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {upvotes} upvote{upvotes !== 1 ? 's' : ''}
              </span>
              {createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Bookmark/Upvote Button */}
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
          <ThumbsUp
            className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
          />
          <span>{isBookmarked ? 'Upvoted' : 'Upvote'}</span>
        </button>
      </div>
    </div>
  );
}
