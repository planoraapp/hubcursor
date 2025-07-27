
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
    <div className="bg-white p-4 rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] text-center mb-6">
      <img
        src={getAvatarUrl(userData?.figureString)}
        alt={userData?.name || t('userNameGuest')}
        className="w-16 h-16 mx-auto rounded-full border-2 border-gray-300 mb-2"
      />
      <p className="font-bold text-gray-800">
        {userData?.name || t('userNameGuest')}
      </p>
      <p className={`text-xs ${userData?.online ? 'text-green-500' : 'text-red-500'}`}>
        {userData?.online ? t('onlineStatus') : t('offlineStatus')}
      </p>
      
      {userData?.motto && (
        <p className="text-xs text-gray-600 mt-1 italic">"{userData.motto}"</p>
      )}

      {!isLoggedIn && !showLoginForm && (
        <button
          onClick={() => setShowLoginForm(true)}
          className="w-full mt-3 bg-[#008800] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
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
            className="w-full px-3 py-2 text-sm border-2 border-[#5a5a5a] rounded-lg focus:outline-none focus:border-[#007bff]"
            disabled={loading}
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !loginUsername.trim()}
              className="flex-1 bg-[#008800] text-white px-3 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? '...' : 'OK'}
            </button>
            <button
              type="button"
              onClick={() => setShowLoginForm(false)}
              className="flex-1 bg-[#dd0000] text-white px-3 py-2 rounded-lg font-medium border-2 border-[#aa0000] border-r-[#ff0000] border-b-[#ff0000] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#ff0000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 text-sm"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="w-full mt-3 bg-[#dd0000] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#aa0000] border-r-[#ff0000] border-b-[#ff0000] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#ff0000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
        >
          {t('logoutButton')}
        </button>
      )}
    </div>
  );
};
