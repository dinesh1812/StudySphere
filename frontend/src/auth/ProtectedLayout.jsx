import { Navigate, Outlet, useLocation } from 'react-router';
import { isAuthenticated } from './auth';

export function ProtectedLayout() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}