import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { Building2, Loader2, Mail, User } from 'lucide-react';
import { authService } from '@/api/authService';
import { getUser } from '@/auth/auth';
import { toast } from 'sonner';

export function ProfilePage() {
  const { username: id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
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

  const roleLabel = profile.role === 'SUPER_ADMIN'
    ? 'Super Admin'
    : profile.role === 'COLLEGE_ADMIN'
      ? 'College Admin'
      : 'Student';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Card (LinkedIn-style) */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />

        {/* Avatar + Info */}
        <div className="px-8 pb-8">
          <div className="-mt-16 mb-4">
            <div className="w-28 h-28 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-semibold uppercase border-4 border-card">
              {initials}
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-1">
            {profile.fullName || 'Unknown User'}
          </h1>

          <p className="text-foreground/70 mb-4">
            {roleLabel}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span>{profile.collegeName || 'No institution'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>ID: #{profile.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* About section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
        <p className="text-muted-foreground text-sm">
          {roleLabel} at {profile.collegeName || 'StudySphere'}.
          Active member of the academic community.
        </p>
      </div>
    </div>
  );
}
