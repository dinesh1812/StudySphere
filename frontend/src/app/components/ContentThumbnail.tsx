import { Link } from 'react-router';
import { User, ArrowBigUp, ArrowBigDown, Calendar } from 'lucide-react';

export interface ContentThumbnailProps {
  id: string;
  title: string;
  content?: string;
  authorName: string;
  authorRole?: string;
  upvotes: number;
  downvotes: number;
  upvoted?: boolean;
  downvoted?: boolean;
  createdAt?: string;
  onUpvote?: () => void;
  onDownvote?: () => void;
}

export function ContentThumbnail({
  id,
  title,
  content,
  authorName,
  authorRole,
  upvotes,
  downvotes,
  upvoted = false,
  downvoted = false,
  createdAt,
  onUpvote,
  onDownvote,
}: ContentThumbnailProps) {

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

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
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-7 h-7 rounded-full ${getAvatarColor()} text-white flex items-center justify-center text-[10px] font-bold`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-foreground truncate">{authorName}</span>
              <span className="mx-1 text-muted-foreground">•</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {authorRole === 'COLLEGE_ADMIN' ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Content Snippet */}
          {snippet && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
              {snippet}
            </p>
          )}

          {/* Metadata Footer + Voting */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center gap-4">
              {createdAt && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(createdAt)}
                </span>
              )}
            </div>

            <div className="flex items-center bg-secondary/30 rounded-full px-2 py-1 gap-1 border border-border/50">
              <button
                onClick={(e) => { e.preventDefault(); onUpvote?.(); }}
                className={`p-1 rounded hover:bg-primary/20 transition-colors ${upvoted ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <ArrowBigUp className={`h-5 w-5 ${upvoted ? 'fill-current' : ''}`} />
              </button>
              <span className={`text-xs font-bold min-w-[1rem] text-center ${upvoted ? 'text-primary' : 'text-foreground'}`}>
                {upvotes}
              </span>
              <button
                onClick={(e) => { e.preventDefault(); onDownvote?.(); }}
                className={`p-1 rounded hover:bg-destructive/20 transition-colors ${downvoted ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                <ArrowBigDown className={`h-5 w-5 ${downvoted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
