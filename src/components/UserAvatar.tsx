
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useState } from 'react';

export const UserAvatar = () => {
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
        alert(t('userNotFound') || 'Usuário não encontrado!');
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
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&direction=2&head_direction=2&gesture=sml&size=m&frame=1&headonly=1`;
  };

  if (!isLoggedIn && !showLoginForm) {
    return (
      <div className="flex flex-col items-center p-4 bg-gradient-to-b from-transparent to-black/5">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-3 border-2 border-gray-400">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 text-center">
          {t('userNameGuest')}
        </p>
        <button
          onClick={() => setShowLoginForm(true)}
          className="bg-[#4ECDC4] hover:bg-[#3BAEA3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
        >
          {t('loginButton')}
        </button>
      </div>
    );
  }

  if (showLoginForm) {
    return (
      <div className="flex flex-col items-center p-4 bg-gradient-to-b from-transparent to-black/5">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-3 border-2 border-gray-400">
          <span className="text-2xl">👤</span>
        </div>
        <form onSubmit={handleLogin} className="w-full space-y-2">
          <input
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Nome do usuário Habbo..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            disabled={loading}
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !loginUsername.trim()}
              className="flex-1 bg-[#4ECDC4] hover:bg-[#3BAEA3] text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'OK'}
            </button>
            <button
              type="button"
              onClick={() => setShowLoginForm(false)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ✕
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-transparent to-black/5">
      <div className="relative mb-3">
        <img
          src={getAvatarUrl(userData?.figureString)}
          alt={userData?.name || t('userNameGuest')}
          className="w-16 h-16 rounded-full border-2 border-[#4ECDC4] shadow-lg"
          onError={(e) => {
            e.currentTarget.src = `https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61&direction=2&head_direction=2&gesture=sml&size=m&frame=1&headonly=1`;
          }}
        />
        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${userData?.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      
      <div className="text-center mb-3">
        <p className="font-bold text-gray-800 text-sm">
          {userData?.name || t('userNameGuest')}
        </p>
        {userData?.motto && (
          <p className="text-xs text-gray-600 italic mt-1 px-2 truncate">
            "{userData.motto}"
          </p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
      >
        {t('logoutButton')}
      </button>
    </div>
  );
};
