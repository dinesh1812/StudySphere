import { Outlet, Link, useLocation } from 'react-router';
import { Shield, User, LogOut, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUser, logout } from '@/auth/auth';
import { authService } from '@/api/authService';

export function SuperAdminLayout() {
  const location = useLocation();
  const user = getUser();
  const [fullName, setFullName] = useState(user?.fullName || '');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const res = await authService.getUserSummary(user.id);
          if (res.success && res.data) {
            setFullName(res.data.fullName);
          }
        } catch (err) {
          console.error("Failed to fetch user data", err);
        }
      }
    };
    fetchUserData();
  }, [user?.id]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/moderation', label: 'Moderation', icon: ShieldAlert },
  ];

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SA';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden h-14 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2 text-destructive font-bold">
          <Shield className="h-5 w-5" />
          <span className="text-base tracking-tight text-foreground">Super Admin</span>
        </div>
        <Link to={`/profile/${user?.id || 'me'}`} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs font-bold">
          {initials}
        </Link>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border shrink-0 h-screen sticky top-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            <span className="text-xl font-semibold text-foreground">Super Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm ${
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

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <Link
            to={`/profile/${user?.id || 'me'}`}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors mb-1"
          >
            <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fullName || 'Super Admin'}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
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

      {/* Bottom Bar - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around px-2 py-3 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 rounded-lg transition-colors ${
                isActive ? 'text-destructive bg-destructive/10' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="p-2 text-destructive border-l border-border pl-4"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
