
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isLoggedIn, isAdmin } = useAuth();

  // Check if user is logged in and is an admin
  if (!isLoggedIn || !isAdmin()) {
    return <Navigate to="/connect-habbo" replace />;
  }

  return <>{children}</>;
};
