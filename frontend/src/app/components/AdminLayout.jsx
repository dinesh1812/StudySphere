import { Outlet, Link, useLocation } from 'react-router';
import { Users, Building2, User, LogOut, Shield, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUser, logout } from '@/auth/auth';
import { authService } from '@/api/authService';

export function AdminLayout() {
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
    { path: '/', label: 'Student Approvals', icon: Users },
    { path: '/events', label: 'Events Management', icon: Calendar },
  ];

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'A';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 md:h-screen md:sticky md:top-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">College Admin</span>
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

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <Link
            to={`/profile/${user?.id || 'me'}`}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors mb-1"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fullName || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">College Admin</p>
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
