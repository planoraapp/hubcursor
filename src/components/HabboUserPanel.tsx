import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { CountryFlags } from '@/components/marketplace/CountryFlags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ChevronLeft, Award, Bell, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { generateUniqueUsername } from '@/utils/usernameUtils';

interface HabboUserProfile {
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  figure_string: string;
  motto: string;
  badges?: Array<{
    code: string;
    name: string;
    description?: string;
  }>;
  is_online?: boolean;
  created_at?: string;
}

interface HabboUserPanelProps {
  sidebarCollapsed?: boolean;
  onExpandSidebar?: () => void;
}

export const HabboUserPanel = ({ sidebarCollapsed = false, onExpandSidebar }: HabboUserPanelProps = {}) => {
  const { habboAccount, isLoggedIn, logout } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState<HabboUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    // Carregar preferência do localStorage, padrão é true (ativado)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('habbo-hub-notification-sound-enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [isOnline, setIsOnline] = useState(() => {
    // Carregar preferência do localStorage, padrão é true (online)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('habbo-hub-online-status-enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Função para remover acentos para compatibilidade com fonte Volter
  const removeAccents = (text: string) => {
    return text
      .replace(/[áàâã]/g, 'a')
      .replace(/[éê]/g, 'e')
      .replace(/[í]/g, 'i')
      .replace(/[óôõ]/g, 'o')
      .replace(/[ú]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ÁÀÂÃ]/g, 'A')
      .replace(/[ÉÊ]/g, 'E')
      .replace(/[Í]/g, 'I')
      .replace(/[ÓÔÕ]/g, 'O')
      .replace(/[Ú]/g, 'U')
      .replace(/[Ç]/g, 'C');
  };

  // Carregar estado inicial do banco de dados
  useEffect(() => {
    if (habboAccount?.supabase_user_id) {
      // Carregar preferência salva do localStorage
      const savedStatus = localStorage.getItem('habbo-hub-online-status-enabled');
      const shouldBeOnline = savedStatus !== null ? savedStatus === 'true' : true;
      
      // Nota: Removido updateStatusInDB - o keep-online agora só faz keep-alive do backend
      // Se precisar atualizar status de usuário no futuro, criar Edge Function separada
      setIsOnline(shouldBeOnline);
      
      setUserProfile({
        habbo_name: habboAccount.habbo_name,
        habbo_id: habboAccount.habbo_id,
        hotel: habboAccount.hotel,
        figure_string: habboAccount.figure_string,
        motto: habboAccount.motto,
        badges: [
          { code: 'DS', name: 'D.S.', description: 'Designer' },
          { code: 'HC', name: 'HC', description: 'Habbo Club' },
          { code: 'VIP', name: 'VIP', description: 'Very Important Person' }
        ],
        is_online: shouldBeOnline,
        created_at: habboAccount.created_at
      });
    }
  }, [habboAccount]);

  const getHotelDisplayName = (hotel: string) => {
    const hotelNames: Record<string, string> = {
      'br': 'habbo.com.br',
      'com': 'habbo.com',
      'es': 'habbo.es',
      'fr': 'habbo.fr',
      'de': 'habbo.de',
      'it': 'habbo.it',
      'nl': 'habbo.nl',
      'fi': 'habbo.fi',
      'tr': 'habbo.com.tr'
    };
    return hotelNames[hotel] || 'habbo.com';
  };

  const handleStatusToggle = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    // Salvar preferência no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('habbo-hub-online-status-enabled', String(newStatus));
    }
    
    // Atualizar banco de dados
    if (habboAccount?.supabase_user_id) {
      try {
        const userId = habboAccount.supabase_user_id;
        // Validar userId antes de enviar
        if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
          return;
        }

        // Nota: Removido update via keep-online - essa função agora só faz keep-alive
        // O status é salvo apenas no localStorage por enquanto
        // Se precisar persistir no banco, criar Edge Function separada ou usar RLS direto
      } catch (error: any) {
        // Silenciar erros 400 completamente
        const is400Error = error?.status === 400 || 
                          error?.message?.includes('400') || 
                          error?.message?.includes('Bad Request') ||
                          error?.context?.status === 400;
        
        if (!is400Error) {
          console.error('[HABBO USER PANEL] Error:', error);
          toast({
            title: "⚠️ Erro",
            description: "Não foi possível atualizar o status. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
      }
    }
    
    toast({
      title: newStatus ? "✅ Status alterado" : "⚠️ Status alterado",
      description: newStatus 
        ? "Você está agora visível no console do site" 
        : "Você está agora oculto no console do site",
    });
  };

  const handleNotificationsToggle = () => {
    const newStatus = !notificationsEnabled;
    setNotificationsEnabled(newStatus);
    
    // Salvar preferência no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('habbo-hub-notification-sound-enabled', String(newStatus));
    }
    
    toast({
      title: newStatus ? "✅ Notificações ativadas" : "⚠️ Notificações desativadas",
      description: newStatus 
        ? "Você receberá alertas sonoros do site" 
        : "Você não receberá mais alertas sonoros do site",
    });
  };

  if (!isLoggedIn || !userProfile) return null;

  // Se a sidebar estiver comprimida, mostrar a figurestring completa do corpo
  if (sidebarCollapsed) {
    const userFullFigureSrc = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(userProfile.habbo_name)}&size=l&direction=2&head_direction=3`;
    
    return (
      <button
        onClick={onExpandSidebar}
        className="w-full flex items-center justify-center p-2 hover:bg-yellow-200/50 transition-colors rounded cursor-pointer"
        aria-label={`Expandir sidebar - ${userProfile.habbo_name}`}
      >
        <img
          src={userFullFigureSrc}
          alt={`Avatar de ${userProfile.habbo_name}`}
          className="h-28 w-auto object-contain"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(rgba(0, 0, 0, 0.3) 0px 4px 8px)',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${encodeURIComponent(userProfile.habbo_name)}&size=l&direction=2&head_direction=3`;
          }}
        />
      </button>
    );
  }

  const getDesignStyles = () => {
    return {
      container: `bg-gradient-to-br from-slate-50 via-white to-slate-100 border-2 border-slate-300 rounded-xl text-slate-800 shadow-xl transition-all duration-[950ms] ease-in-out ${isCollapsed ? 'p-1 h-fit' : 'p-4'}`,
      button: 'bg-gradient-to-r from-slate-200 to-slate-100 hover:from-slate-300 hover:to-slate-200 px-3 py-2 rounded-lg text-left transition-all duration-200 shadow-sm hover:shadow-md',
      infoBar: 'bg-gradient-to-r from-slate-200 to-slate-100 px-3 py-2 rounded-lg shadow-sm',
      logout: 'bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 px-3 py-2 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
      border: 'border-slate-300'
    };
  };

  const styles = getDesignStyles();

  return (
    <div className={`${styles.container} px-1`}>
      <div className="relative overflow-hidden">
        <div className={`flex transition-transform duration-300 ease-in-out ${showSettings ? '-translate-x-full' : 'translate-x-0'}`}>
          {/* Painel Principal */}
          <div className="w-full flex-shrink-0">
            {/* Header */}
            <div className={`flex items-center justify-between ${isCollapsed ? 'px-2 py-1 mb-1' : 'px-1 mb-3'}`}>
              <h3 
                className="text-white font-bold text-base flex-1 pr-2"
                style={{
                  fontFamily: 'Volter',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px',
                  textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black'
                }}
              >
                {userProfile.habbo_name}
              </h3>
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
                style={{
                  fontFamily: 'Volter',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {isCollapsed ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Avatar and Info */}
            <div className={`flex items-start gap-3 ${isCollapsed ? 'mb-1' : 'mb-4'}`}>
              <div className="flex-shrink-0 relative">
                {/* Sombra circular simulando luz acima */}
                {!isCollapsed && (
                  <div 
                    className="absolute -top-2 -left-2 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 70%)',
                      filter: 'blur(8px)'
                    }}
                  />
                )}
                <img
                  src={isCollapsed 
                    ? `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userProfile.habbo_name}&size=l&direction=2&head_direction=3&headonly=1`
                    : `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userProfile.habbo_name}&size=l&direction=2&head_direction=3`
                  }
                  alt={`Avatar de ${userProfile.habbo_name}`}
                  className={isCollapsed ? "w-16 h-16 object-contain" : "h-28 w-auto object-contain"}
                  style={{ 
                    imageRendering: 'pixelated',
                    filter: isCollapsed ? 'none' : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = isCollapsed 
                      ? `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${userProfile.habbo_name}&size=l&direction=2&head_direction=3&headonly=1`
                      : `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${userProfile.habbo_name}&size=l&direction=2&head_direction=3`;
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div 
                  className="text-gray-600 text-sm font-bold mb-1"
                  style={{
                    fontFamily: 'Volter',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    letterSpacing: '0.3px'
                  }}
                >
                  {getHotelDisplayName(userProfile.hotel)}
                </div>
                <div 
                  className="text-gray-600 text-sm mb-2 line-clamp-2"
                  style={{
                    fontFamily: 'Volter',
                    fontSize: '11px',
                    fontWeight: 'normal',
                    letterSpacing: '0.3px'
                  }}
                >
                  {userProfile.motto || 'Sem motto definido'}
                </div>
                
                {/* Badge - Only show when not collapsed */}
                {userProfile.badges && userProfile.badges.length > 0 && !isCollapsed && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {userProfile.badges[0].code}
                      </span>
                    </div>
                    <span 
                      className="text-xs text-gray-700"
                      style={{
                        fontFamily: 'Volter',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px'
                      }}
                    >
                      {userProfile.badges[0].name}
                    </span>
                  </div>
                )}
              </div>
            </div>

      {/* Info Section - Only show when not collapsed */}
      {!isCollapsed && (
        <>
          <div className="space-y-2 mb-3">
            <div className={`flex items-center justify-between ${styles.infoBar}`}>
              <span 
                className="text-gray-900 text-sm"
                style={{
                  fontFamily: 'Volter',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px'
                  }}
                >
                  {removeAccents(t('sidebar.userPanel.monthlyXP'))}: 16
                </span>
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <Link to={`/home/${generateUniqueUsername(userProfile.habbo_name, userProfile.hotel)}`} className="block">
              <button className={`w-full flex items-center justify-between ${styles.button}`}>
                <span 
                  className="text-gray-900 text-sm"
                  style={{
                    fontFamily: 'Volter',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    letterSpacing: '0.3px'
                  }}
                >
                  {removeAccents(t('sidebar.userPanel.hubHome'))}
                </span>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/assets/homebutton.png" 
                    alt="Profile" 
                    className="w-4 h-4 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </button>
            </Link>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`w-full flex items-center justify-between ${styles.button}`}
            >
              <span 
                className="text-gray-900 text-sm"
                style={{
                  fontFamily: 'Volter',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px'
                  }}
                >
                  {removeAccents(t('sidebar.userPanel.settings'))}
                </span>
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                <img 
                  src="/assets/settings.gif" 
                  alt="⚙️" 
                  className="w-4 h-4 object-contain" 
                  style={{ imageRendering: 'pixelated' }} 
                />
              </div>
            </button>
          </div>
        </>
            )}

            {/* Logout Button - Always visible */}
            <div className={`${isCollapsed ? 'mt-0' : 'mt-3 pt-3 border-t'} ${styles.border}`}>
              <button 
                onClick={logout}
                className={`w-full ${styles.logout} flex items-center justify-center gap-2`}
                style={{
                  fontFamily: 'Volter',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px'
                }}
              >
                <img 
                  src="/assets/logout.png" 
                  alt="Logout" 
                  className="w-5 h-5 flex-shrink-0"
                  style={{ 
                    imageRendering: 'pixelated',
                    objectFit: 'contain'
                  }}
                />
                <span>{removeAccents(t('sidebar.userPanel.logout'))}</span>
              </button>
            </div>
          </div>

          {/* Painel de Configurações - Only render when needed */}
          {showSettings && (
            <div className="w-full flex-shrink-0 flex flex-col px-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 
                className="text-white font-bold text-base flex-1 pr-2"
                style={{
                  fontFamily: 'Volter',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px',
                  textShadow: '-1.5px 0 black, 0 1.5px black, 1.5px 0 black, 0 -1.5px black'
                }}
              >
                {removeAccents(t('sidebar.userPanel.settings'))}
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
                style={{
                  fontFamily: 'Volter',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>

            {/* Configurações */}
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* Status no Site */}
              <div className={`${styles.infoBar} p-4 rounded-lg text-center`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Wifi className="w-4 h-4 text-gray-600" />
                  <span 
                    className="text-gray-900 font-bold"
                    style={{
                      fontFamily: 'Volter',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {removeAccents(t('sidebar.userPanel.status'))}
                  </span>
                </div>
                <div className="flex justify-center mb-2">
                  <button
                    onClick={handleStatusToggle}
                    className="transition-all hover:opacity-80"
                    title={isOnline ? "Ocultar do Console" : "Mostrar no Console"}
                  >
                    <img 
                      src={isOnline ? "/assets/toggleon.png" : "/assets/toggleoff.png"}
                      alt={isOnline ? "Visível no Console" : "Oculto no Console"}
                      className="w-auto h-6 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                </div>
                <div className="text-xs text-gray-600">
                  {isOnline ? 'Visível no console do site' : 'Oculto no console do site'}
                </div>
              </div>

              {/* Notificações */}
              <div className={`${styles.infoBar} p-4 rounded-lg text-center`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-gray-600" />
                  <span 
                    className="text-gray-900 font-bold"
                    style={{
                      fontFamily: 'Volter',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {removeAccents(t('sidebar.userPanel.notifications'))}
                  </span>
                </div>
                <div className="flex justify-center mb-2">
                  <button
                    onClick={handleNotificationsToggle}
                    className="transition-all hover:opacity-80"
                    title={notificationsEnabled ? "Desativar Notificações" : "Ativar Notificações"}
                  >
                    <img 
                      src={notificationsEnabled ? "/assets/toggleon.png" : "/assets/toggleoff.png"}
                      alt={notificationsEnabled ? "Notificações Ativas" : "Notificações Desativas"}
                      className="w-auto h-6 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                </div>
                <div className="text-xs text-gray-600">
                  {notificationsEnabled ? 'Receber alertas do site' : 'Não receber alertas do site'}
                </div>
              </div>

            </div>

            {/* Botão Voltar */}
            <div className="mt-auto pt-3 border-t border-slate-300">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-gradient-to-r from-slate-300 to-slate-200 hover:from-slate-400 hover:to-slate-300 px-3 py-2 rounded-lg text-left transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'Volter',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px'
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{removeAccents(t('sidebar.userPanel.back'))}</span>
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};