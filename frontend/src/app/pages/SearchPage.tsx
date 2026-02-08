import { useState } from 'react';
import { ContentThumbnail } from '@/app/components/ContentThumbnail';
import { mockContent } from '@/app/data/mockContent';
import { Search, Filter, X } from 'lucide-react';

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(true);

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

  const domains = Array.from(new Set(mockContent.map((c) => c.domain)));
  const contentTypes = ['Article', 'Discussion', 'Methodology', 'Literature Review'];
  const visibilityOptions = ['Public', 'Institution-Only', 'Private Project'];
  const institutions = [...new Set(mockContent.map(c => c.institution))];


const filteredContent = mockContent.filter((content) => {
  const matchesSearch =
    !searchQuery ||
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.topics.some((t) =>
      t.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const matchesDomain =
    !selectedDomain || content.domain === selectedDomain;

  const matchesContentType =
    !selectedContentType || content.contentType === selectedContentType;

  const matchesVisibility =
    !selectedVisibility || content.visibility === selectedVisibility;

  const matchesInstitution =
    !selectedInstitution || content.institution === selectedInstitution;

  return (
    matchesSearch &&
    matchesDomain &&
    matchesContentType &&
    matchesVisibility &&
    matchesInstitution
  );
});


  const hasActiveFilters = selectedDomain || selectedContentType || selectedVisibility;

  const clearFilters = () => {
    setSelectedDomain('');
    setSelectedContentType('');
    setSelectedVisibility('');
    setSelectedInstitution('');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-6">
          Search Academic Content
        </h1>

        {/* Semantic Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, domain, topics, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Suggested Searches */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Suggested:</span>
          {[  'Computer Science','Artificial Intelligence','Machine Learning','Information Technology','Cyber Security','Cryptography'].map(
            (suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-accent transition-colors"
              >
                {suggestion}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <aside
          className={`${
            showFilters ? 'w-72' : 'w-0'
          } flex-shrink-0 transition-all duration-300 overflow-hidden`}
        >
          <div className="bg-card border border-border rounded-lg p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Filters</h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Domain Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="">All Domains</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Type Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Content Type
              </label>
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="">All Types</option>
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution Filter */}
<div className="mb-6">
  <label className="block text-sm font-medium text-foreground mb-2">
    Institution
  </label>
  <select
    value={selectedInstitution}
    onChange={(e) => setSelectedInstitution(e.target.value)}
    className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
  >
    <option value="">All Institutions</option>
    {institutions.map((institution) => (
      <option key={institution} value={institution}>
        {institution}
      </option>
    ))}
  </select>
</div>


            {/* Visibility Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Visibility
              </label>
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="">All Visibility</option>
                {visibilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {filteredContent.length} result{filteredContent.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No results found. Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredContent.map((content) => (
                <ContentThumbnail
                  key={content.id}
                  {...content}
                  isBookmarked={bookmarkedIds.has(content.id)}
                  onBookmark={() => handleBookmark(content.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
