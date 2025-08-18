
import { useAuth } from './useAuth';

export const useSimpleAuth = () => {
  const { user, habboAccount, isLoggedIn, loading } = useAuth();
  
  return {
    user,
    habboAccount,
    isLoggedIn,
    loading
  };
};
