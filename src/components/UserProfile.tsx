
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
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&direction=2&head_direction=2&gesture=sml&size=s&frame=1`;
  };

  return (
    <div className="habbo-profile">
      <img
        src={getAvatarUrl(userData?.figureString)}
        alt={userData?.name || t('userNameGuest')}
        className="w-16 h-16 mx-auto rounded-full mb-2 border-2 border-gray-300"
      />
      <p className="font-bold text-gray-800">
        {userData?.name || t('userNameGuest')}
      </p>
      <p className={`text-xs ${userData?.online ? 'text-green-600' : 'text-red-600'}`}>
        {userData?.online ? t('onlineStatus') : t('offlineStatus')}
      </p>
      
      {userData?.motto && (
        <p className="text-xs text-gray-600 mt-1 italic">"{userData.motto}"</p>
      )}

      {!isLoggedIn && !showLoginForm && (
        <button
          onClick={() => setShowLoginForm(true)}
          className="habbo-button-green w-full mt-3"
        >
          {t('loginButton')}
        </button>
      )}

      {showLoginForm && (
        <form onSubmit={handleLogin} className="mt-3 space-y-2">
          <input
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Nome do usuário Habbo..."
            className="habbo-input w-full text-sm"
            disabled={loading}
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !loginUsername.trim()}
              className="habbo-button-green flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'OK'}
            </button>
            <button
              type="button"
              onClick={() => setShowLoginForm(false)}
              className="habbo-button-red flex-1 text-sm"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="habbo-button-red w-full mt-3"
        >
          {t('logoutButton')}
        </button>
      )}
    </div>
  );
};
