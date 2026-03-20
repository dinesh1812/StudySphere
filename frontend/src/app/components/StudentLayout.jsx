import { Outlet, Link, useLocation } from 'react-router';
import { Home, Search, Building2, Folder, User, LogOut, Users, FileText, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUser, logout } from '@/auth/auth';
import { UserProvider, useUser } from '@/app/context/UserContext';
import { toast } from 'sonner';

function StudentLayoutContent() {
  const location = useLocation();
  const { userData } = useUser(); 

  const fullName = userData?.fullName || '';

  // The useEffect for fetching user data is now handled by UserProvider
  // and the user object in context should be reactive.
  // So, this useEffect is no longer needed here.

  const navItems = [
    { path: '/', label: 'General', icon: Home },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/workspace', label: 'Workspace', icon: Folder },
    { path: '/institution', label: 'My Institution', icon: Building2 },
    { path: '/events', label: 'Events Hub', icon: Calendar },
    { path: '/search', label: 'Search', icon: Search },
  ];

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden h-14 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold text-foreground tracking-tight">StudySphere</span>
        </Link>
        <Link to={`/profile/${userData?.id || 'me'}`} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
          {initials}
        </Link>
      </div>

      {/* Sidebar - Desktop only */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border shrink-0 h-screen sticky top-0 flex-col">
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
            to={`/profile/${userData?.id || 'me'}`}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors mb-1"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground">{userData?.role || 'Student'}</p>
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

      {/* Bottom Bar - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around px-2 py-3 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}

export function StudentLayout() {
  return (
    <UserProvider>
      <StudentLayoutContent />
    </UserProvider>
  );
}
