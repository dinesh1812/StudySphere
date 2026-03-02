import { Plus, Users, Lock, FileText, FolderOpen } from 'lucide-react';

export function WorkspacePage() {
  const projects = [
    {
      id: '1',
      title: 'Neural Network Optimization Study',
      type: 'Research Team',
      members: 5,
      visibility: 'Private',
      lastUpdated: '2 days ago',
    },
    {
      id: '2',
      title: 'Climate Data Analysis Collaboration',
      type: 'Cross-Institution',
      members: 8,
      visibility: 'Institution-Only',
      lastUpdated: '1 week ago',
    },
    {
      id: '3',
      title: 'Quantum Computing Literature Review',
      type: 'Personal',
      members: 1,
      visibility: 'Private',
      lastUpdated: '3 days ago',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Research Workspace
          </h1>
          <p className="text-muted-foreground">
            Manage your research teams, projects, and collaborative work
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors text-left group">
          <Users className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            Create Research Team
          </h3>
          <p className="text-sm text-muted-foreground">
            Invite collaborators to work together
          </p>
        </button>

        <button className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors text-left group">
          <FileText className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            Draft Article
          </h3>
          <p className="text-sm text-muted-foreground">
            Start writing a new research article
          </p>
        </button>

        <button className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors text-left group">
          <FolderOpen className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            Cross-Institution Project
          </h3>
          <p className="text-sm text-muted-foreground">
            Collaborate across universities
          </p>
        </button>
      </div>

      {/* Active Projects */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Projects</h2>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="h-4 w-4" />
                    {project.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {project.members} member{project.members !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-4 w-4" />
                    {project.visibility}
                  </span>
                  <span>Updated {project.lastUpdated}</span>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors">
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
