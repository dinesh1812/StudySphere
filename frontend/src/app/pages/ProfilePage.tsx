import { useParams } from 'react-router';
import { Building2, BookOpen, FileText } from 'lucide-react';

export function ProfilePage() {
  const { username } = useParams();

  const contributions = [
    { title: 'Deep Learning in Medical NLP', type: 'Article', date: 'Jan 2026' },
    { title: 'Climate Change Impact Review', type: 'Literature Review', date: 'Dec 2025' },
    { title: 'Quantum Cryptography Discussion', type: 'Discussion', date: 'Nov 2025' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-semibold">
            JS
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              John Doe
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Building2 className="h-4 w-4" />
              <span>RMK Engineering College</span>
            </div>
            <p className="text-foreground/80 mb-6">
              Researcher specializing in machine learning applications in natural language
              processing and computational linguistics. Focused on developing robust models
              for medical text analysis.
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
                <div className="text-2xl font-semibold text-foreground">23</div>
                <div className="text-sm text-muted-foreground">Contributions</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">156</div>
                <div className="text-sm text-muted-foreground">Citations</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">8</div>
                <div className="text-sm text-muted-foreground">Collaborations</div>
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
