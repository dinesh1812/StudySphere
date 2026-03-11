import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { Building2, BookOpen, FileText, Loader2 } from 'lucide-react';
import { authService } from '@/api/authService';
import { getUser } from '@/auth/auth';
import { toast } from 'sonner';

export function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // If id is 'me' or undefined, use the logged-in user's ID
        let targetId = id;
        if (!targetId || targetId === 'me') {
          targetId = getUser()?.id;
        }

        if (targetId) {
          const res = await authService.getUserSummary(targetId);
          if (res.success) {
            setProfile(res.data);
          }
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const initials = profile.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const contributions = [
    { title: 'Deep Learning in Medical NLP', type: 'Article', date: 'Jan 2026' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-semibold uppercase">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {profile.fullName || 'Unknown User'}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Building2 className="h-4 w-4" />
              <span>{profile.collegeName || 'Unknown College'}</span>
            </div>
            <p className="text-foreground/80 mb-6">
              {profile.role === 'COLLEGE_ADMIN' ? 'College Administration Staff' : 'Student Researcher'}
            </p>

            {/* Academic Interests */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Academic Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Machine Learning',
                  'Natural Language Processing',
                  'Healthcare AI',
                  'Deep Learning',
                  'Computational Linguistics',
                ].map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-md border border-border"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-6 border-t border-border">
              <div>
                <div className="text-2xl font-semibold text-foreground">{profile.postsCount}</div>
                <div className="text-sm text-muted-foreground">Contributions</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">{profile.totalUpvotes}</div>
                <div className="text-sm text-muted-foreground">Reputation</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">{profile.communitiesCount}</div>
                <div className="text-sm text-muted-foreground">Communities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Contributions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Recent Contributions
        </h2>
      </div>

      <div className="space-y-3">
        {contributions.map((contribution, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {contribution.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {contribution.type}
                  </span>
                  <span>{contribution.date}</span>
                </div>
              </div>
              <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
