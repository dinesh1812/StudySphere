import { useParams, Link } from 'react-router';
import { mockContent } from '@/app/data/mockContent';
import { ArrowLeft, Building2, Calendar, User, Globe, Users, Lock } from 'lucide-react';

export function ContentViewPage() {
  const { id } = useParams();
  const content = mockContent.find((c) => c.id === id);

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Content not found</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const getVisibilityIcon = () => {
    switch (content.visibility) {
      case 'Public':
        return <Globe className="h-4 w-4" />;
      case 'Institution-Only':
        return <Users className="h-4 w-4" />;
      case 'Private Project':
        return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      {/* Main Content */}
      <article className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header Image */}
        {content.imageUrl && (
          <div className="aspect-[21/9] bg-muted overflow-hidden">
            <img
              src={content.imageUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Metadata Section */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="inline-block px-3 py-1.5 text-sm font-medium rounded border bg-blue-100 text-blue-700 border-blue-200">
                {content.contentType}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {getVisibilityIcon()}
                {content.visibility}
              </span>
            </div>

            <h1 className="text-4xl font-semibold text-foreground mb-6">
              {content.title}
            </h1>

            {/* Taxonomy */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md font-medium">
                {content.domain}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md font-medium">
                {content.subdomain}
              </span>
              {content.topics.length > 0 && (
                <>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex flex-wrap gap-2">
                    {content.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-accent text-accent-foreground text-sm rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Author & Institution */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{content.institution}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Dr. John Doe</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>January 15, 2026</span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="prose max-w-none">
            <h2>Abstract</h2>
            <p className="text-foreground/80 leading-relaxed">
              This comprehensive study examines the latest developments in the field, analyzing
              current methodologies and proposing novel approaches to address existing challenges.
              Through rigorous analysis and empirical validation, we demonstrate the effectiveness
              of our proposed framework across multiple test cases.
            </p>

            <h2>Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              The field has seen significant advances in recent years, with researchers making
              substantial progress in understanding fundamental principles and developing practical
              applications. This work builds upon previous research while introducing innovative
              methodologies that address current limitations.
            </p>

            <h2>Methodology</h2>
            <p className="text-foreground/80 leading-relaxed">
              Our research employs a mixed-methods approach, combining quantitative analysis with
              qualitative insights. Data collection was conducted across multiple sites, ensuring
              comprehensive coverage and robust findings. Statistical validation was performed
              using industry-standard techniques.
            </p>

            <h2>Results</h2>
            <p className="text-foreground/80 leading-relaxed">
              The findings reveal significant patterns and relationships that support our initial
              hypotheses. Detailed analysis demonstrates the practical implications of these
              results for both academic research and real-world applications.
            </p>

            <h2>Conclusion</h2>
            <p className="text-foreground/80 leading-relaxed">
              This work contributes to the growing body of knowledge in the field by providing
              evidence-based insights and practical methodologies. Future research directions
              include expanding the scope of investigation and exploring additional applications
              of the proposed framework.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
