import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/app/components/RootLayout';
import { ProtectedLayout } from '@/auth/ProtectedLayout';
import { HomePage } from '@/app/pages/HomePage';
import { SearchPage } from '@/app/pages/SearchPage';
import { ContentViewPage } from '@/app/pages/ContentViewPage';
import { InstitutionPage } from '@/app/pages/InstitutionPage';
import { WorkspacePage } from '@/app/pages/WorkspacePage';
import { ProfilePage } from '@/app/pages/ProfilePage';
import { LoginPage } from '@/app/pages/LoginPage';
import { SignupPage } from '@/app/pages/SignupPage';

export const router = createBrowserRouter([
  {
    Component: ProtectedLayout,
    children: [
      {
        path: '/',
        Component: RootLayout,
        children: [
          { index: true, Component: HomePage },
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