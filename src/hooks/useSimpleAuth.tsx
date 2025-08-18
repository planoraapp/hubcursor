
import { useAuth } from './useAuth';

export const useSimpleAuth = () => {
  const auth = useAuth();
  
  return {
    habboAccount: auth.habboAccount,
    isLoggedIn: auth.isLoggedIn,
    user: auth.user,
    loading: auth.loading
  };
};
