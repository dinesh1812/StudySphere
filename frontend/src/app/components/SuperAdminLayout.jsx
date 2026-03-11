import { Outlet, Link, useLocation } from 'react-router';
import { Building2, Shield, User, FileText, Settings } from 'lucide-react';
import { getUser } from '@/auth/auth';

export function SuperAdminLayout() {
  const location = useLocation();
  const user = getUser();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/super-admin/institutions', label: 'Manage Institutions', icon: Building2 },
    { path: '/super-admin/settings', label: 'Global Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for Super Admin */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 md:h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            <span className="text-xl font-semibold text-foreground">Super Admin</span>
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
                    ? 'bg-destructive/10 text-destructive font-medium'
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
            <span>{user?.fullName || 'Super Admin'}</span>
          </Link>
        </header>
        <main className="p-6 md:p-8 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
