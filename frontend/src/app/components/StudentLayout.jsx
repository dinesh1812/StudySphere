import { Outlet, Link, useLocation } from 'react-router';
import { Home, Search, Building2, Folder, User, LogOut, Users, FileText, Calendar } from 'lucide-react';
import { getUser, logout } from '@/auth/auth';

export function StudentLayout() {
  const location = useLocation();
  const user = getUser();

  const navItems = [
    { path: '/', label: 'General', icon: Home },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/workspace', label: 'Workspace', icon: Folder },
    { path: '/institution', label: 'My Institution', icon: Building2 },
    { path: '/events', label: 'Events Hub', icon: Calendar },
    { path: '/search', label: 'Search', icon: Search },
  ];

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 md:h-screen md:sticky md:top-0 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">StudySphere</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm ${
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

        {/* User Section at Bottom */}
        <div className="p-4 border-t border-border">
          <Link
            to={`/profile/${user?.id || 'me'}`}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors mb-1"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground">Student</p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md w-full text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
