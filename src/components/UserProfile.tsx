
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export const UserProfile = () => {
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

  return (
    <div className="px-4 mb-6">
      <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <div className="relative mb-3">
          <img
            src={getAvatarUrl(userData?.figureString)}
            alt={userData?.name || t('userNameGuest')}
            className="w-20 h-20 rounded-full border-4 border-white/50 shadow-lg bg-white/20 backdrop-blur-sm"
          />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${userData?.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
        
        <h3 className="font-bold text-white text-center mb-1">
          {userData?.name || t('userNameGuest')}
        </h3>
        
        <p className={`text-xs ${userData?.online ? 'text-green-200' : 'text-red-200'} mb-2`}>
          {userData?.online ? t('onlineStatus') : t('offlineStatus')}
        </p>
        
        {userData?.motto && (
          <p className="text-xs text-white/70 text-center mb-3 italic">"{userData.motto}"</p>
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
              className="w-full px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/50 text-sm"
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
      </div>
    </div>
  );
};
