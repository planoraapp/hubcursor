
import { useSupabaseAuth } from './useSupabaseAuth';

// Admin users list - using Supabase data
const ADMIN_USERS = ['habbohub', 'beebop'];

export const useAuth = () => {
  const { user, session, habboAccount, loading, signOut } = useSupabaseAuth();

  const isLoggedIn = !loading && !!user && !!habboAccount;

  const userData = habboAccount ? {
    name: habboAccount.habbo_name,
    figureString: '', // Will be fetched from Habbo API when needed
    online: false, // Will be updated from Habbo API
    motto: '',
    memberSince: '',
    lastAccessTime: '',
    profileVisible: true
  } : null;

  const isAdmin = () => {
    return isLoggedIn && habboAccount?.habbo_name && ADMIN_USERS.includes(habboAccount.habbo_name.toLowerCase());
  };

  const isAdminUser = (username: string) => {
    return ADMIN_USERS.includes(username.toLowerCase());
  };

  const logout = async () => {
    await signOut();
  };

  return {
    isLoggedIn,
    userData,
    loading,
    logout,
    isAdmin,
    isAdminUser,
    user,
    session,
    habboAccount
  };
};

// Legacy functions for backwards compatibility
export const login = () => {
  console.warn('login() is deprecated. Use the new Supabase auth flow.');
  return Promise.resolve(false);
};

export const loginWithVerification = () => {
  console.warn('loginWithVerification() is deprecated. Use the new Supabase auth flow.');
  return Promise.resolve(false);
};
