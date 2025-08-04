
import { useSupabaseAuth } from './useSupabaseAuth';

export const useAuth = () => {
  const { user, loading } = useSupabaseAuth();
  
  return {
    user,
    loading,
    isAuthenticated: !!user
  };
};
