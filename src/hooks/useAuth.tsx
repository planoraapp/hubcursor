// This file is deprecated. Please use useUnifiedAuth instead.
// Redirecting all useAuth calls to useUnifiedAuth for compatibility.

import { useUnifiedAuth } from './useUnifiedAuth';

export const useAuth = () => {
  console.warn('⚠️ [useAuth] DEPRECATED: Please use useUnifiedAuth instead');
  return useUnifiedAuth();
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn('⚠️ [AuthProvider] DEPRECATED: Please use UnifiedAuthProvider instead');
  return <>{children}</>;
};