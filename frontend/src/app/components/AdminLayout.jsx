import { Outlet, Link, useLocation } from 'react-router';
import { Users, FileCheck, Building2, User } from 'lucide-react';
import { getUser } from '@/auth/auth';

export function AdminLayout() {
  const location = useLocation();
  const user = getUser();

  const navItems = [
    { path: '/', label: 'Overview', icon: Building2 },
    { path: '/admin/users', label: 'Manage Students', icon: Users },
    { path: '/admin/content', label: 'Content Moderation', icon: FileCheck },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for College Admin */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 md:h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">College Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card flex items-center justify-end px-6 sticky top-0">
          <Link
            to={`/profile/${user?.id || 'me'}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="h-4 w-4" />
            <span>{user?.fullName || 'College Admin'}</span>
          </Link>
        </header>
        <main className="p-6 md:p-8 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
