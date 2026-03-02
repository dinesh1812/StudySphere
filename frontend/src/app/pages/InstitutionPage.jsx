import { useState } from 'react';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { mockContent } from '@/app/data/mockContent';
import { Building2, Shield, Users, Award } from 'lucide-react';

export function InstitutionPage() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Filter for institution-only and public content
  const institutionContent = mockContent.filter(
    (c) => c.visibility === 'Institution-Only' || c.visibility === 'Public'
  );

  const handleBookmark = (id) => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutionContent.map((content) => (
          <ContentThumbnail
            key={content.id}
            {...content}
            isBookmarked={bookmarkedIds.has(content.id)}
            onBookmark={() => handleBookmark(content.id)}
          />
        ))}
      </div>

      {institutionContent.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">
            No institutional content available at this time.
          </p>
        </div>
      )}
    </div>
  );
}
