
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isLoggedIn, userData } = useAuth();

  // Check if user is logged in and is the admin user
  if (!isLoggedIn || userData?.name?.toLowerCase() !== 'habbohub') {
    return <Navigate to="/connect-habbo" replace />;
  }

  return <>{children}</>;
};
