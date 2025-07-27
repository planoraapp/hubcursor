
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

interface UserProfileProps {
  collapsed?: boolean;
}

export const UserProfile = ({ collapsed = false }: UserProfileProps) => {
  const { isLoggedIn, userData, loading, login, logout } = useAuth();
  const { t } = useLanguage();
  const [loginUsername, setLoginUsername] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername.trim()) {
      const success = await login(loginUsername.trim());
      if (success) {
        setShowLoginForm(false);
        setLoginUsername('');
      } else {
        alert('Usuário não encontrado!');
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowLoginForm(false);
    setLoginUsername('');
  };

  const getAvatarUrl = (figureString?: string) => {
    const defaultFigure = 'hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61';
    const figure = figureString || defaultFigure;
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&direction=2&head_direction=2&gesture=sml&size=l&frame=1&headonly=1`;
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <img
            src={getAvatarUrl(userData?.figureString)}
            alt={userData?.name || t('userNameGuest')}
            className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-white/20 backdrop-blur-sm"
          />
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white ${userData?.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
    >
      <div className="relative mb-3">
        <img
          src={getAvatarUrl(userData?.figureString)}
          alt={userData?.name || t('userNameGuest')}
          className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white/20 backdrop-blur-sm"
        />
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${userData?.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <h3 className="font-bold text-gray-800 text-center mb-1">
        {userData?.name || t('userNameGuest')}
      </h3>
      
      <p className={`text-xs mb-2 ${userData?.online ? 'text-green-600' : 'text-red-600'}`}>
        {userData?.online ? t('onlineStatus') : t('offlineStatus')}
      </p>
      
      {userData?.motto && (
        <p className="text-xs text-gray-600 text-center mb-3 italic">"{userData.motto}"</p>
      )}

      {!isLoggedIn && !showLoginForm && (
        <button
          onClick={() => setShowLoginForm(true)}
          className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-700 transition-all duration-200"
        >
          {t('loginButton')}
        </button>
      )}

      {showLoginForm && (
        <div className="w-full space-y-2">
          <input
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Nome do usuário Habbo..."
            className="w-full px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-700 placeholder-gray-500 focus:outline-none focus:border-sky-400 text-sm"
            disabled={loading}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleLogin}
              disabled={loading || !loginUsername.trim()}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-2 px-3 rounded-lg hover:from-green-500 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? '...' : 'OK'}
            </button>
            <button
              onClick={() => setShowLoginForm(false)}
              className="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white font-bold py-2 px-3 rounded-lg hover:from-red-500 hover:to-red-700 transition-all duration-200 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-400 to-red-600 text-white font-bold py-2 px-4 rounded-lg hover:from-red-500 hover:to-red-700 transition-all duration-200"
        >
          {t('logoutButton')}
        </button>
      )}
    </motion.div>
  );
};
