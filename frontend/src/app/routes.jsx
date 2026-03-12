import { createBrowserRouter } from 'react-router';
import { StudentLayout } from '@/app/components/StudentLayout';
import { AdminLayout } from '@/app/components/AdminLayout';
import { SuperAdminLayout } from '@/app/components/SuperAdminLayout';
import { ProtectedLayout } from '@/auth/ProtectedLayout';
import { GlobalErrorLayout } from '@/app/components/GlobalErrorLayout';

import { HomePage } from '@/app/pages/HomePage';
import { CommunityPage } from '@/app/pages/CommunityPage';
import { SearchPage } from '@/app/pages/SearchPage';
import { ContentViewPage } from '@/app/pages/ContentViewPage';
import { InstitutionPage } from '@/app/pages/InstitutionPage';
import { WorkspacePage } from '@/app/pages/WorkspacePage';
import { ProfilePage } from '@/app/pages/ProfilePage';
import { LoginPage } from '@/app/pages/LoginPage';
import { SignupPage } from '@/app/pages/SignupPage';
import { AdminDashboard } from '@/app/pages/AdminDashboard';
import { SuperAdminDashboard } from '@/app/pages/SuperAdminDashboard';

import { getUser } from '@/auth/auth';

function DashboardRouter() {
  const user = getUser();
  if (user?.role === 'SUPER_ADMIN') return <SuperAdminLayout />;
  if (user?.role === 'COLLEGE_ADMIN') return <AdminLayout />;
  return <StudentLayout />;
}

function RoleBasedIndex() {
  const user = getUser();
  if (user?.role === 'SUPER_ADMIN') return <SuperAdminDashboard />;
  if (user?.role === 'COLLEGE_ADMIN') return <AdminDashboard />;
  return <HomePage />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: ProtectedLayout,
    errorElement: <GlobalErrorLayout />,
    children: [
      {
        path: '/',
        Component: DashboardRouter,
        children: [
          { index: true, Component: RoleBasedIndex },
          { path: 'community', Component: CommunityPage },
          { path: 'search', Component: SearchPage },
          { path: 'content/:id', Component: ContentViewPage },
          { path: 'institution', Component: InstitutionPage },
          { path: 'workspace', Component: WorkspacePage },
          { path: 'profile/:username', Component: ProfilePage },
        ],
      },
    ],
  },
  { path: '/login', Component: LoginPage },
  { path: '/signup', Component: SignupPage },
]);