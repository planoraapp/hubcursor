import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, RefreshCw, Loader2, AlertCircle, Users, MessageSquare, Search, Trophy, Home, Crown } from 'lucide-react';
import { useHabboPublicAPI } from '@/hooks/useHabboPublicAPI';
import { useAuth } from '@/hooks/useAuth';
import { PixelFrame } from './PixelFrame';
import { UserProfile } from './BeebopProfile';
import { cn } from '@/lib/utils';

type TabType = 'account' | 'feed' | 'photos' | 'chat';

interface TabButton {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  activeColor: string;
}

const tabs: TabButton[] = [
  {
    id: 'account',
    label: 'My Info',
    icon: <User className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'feed',
    label: 'Friends',
    icon: <Users className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'photos',
    label: 'Find',
    icon: <Search className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  },
  {
    id: 'chat',
    label: 'Help',
    icon: <MessageSquare className="w-4 h-4" />,
    color: '#FDCC00',
    hoverColor: '#FEE100',
    activeColor: '#FBCC00'
  }
];

export const FunctionalConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const { habboAccount, isLoggedIn } = useAuth();
  
  // Usar o username do usuário logado ou 'Beebop' como fallback
  const username = habboAccount?.habbo_name || 'Beebop';
  
  const { 
    userData, 
    profileData,
    badges, 
    rooms, 
    groups, 
    friends, 
    photos, 
    isLoading, 
    error, 
    refreshData 
  } = useHabboPublicAPI(username);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <UserProfile />;
      case 'feed':
        return <FeedTab badges={badges} rooms={rooms} groups={groups} friends={friends} isLoading={isLoading} />;
      case 'photos':
        return <PhotosTab badges={badges} rooms={rooms} photos={photos} isLoading={isLoading} />;
      case 'chat':
        return <ChatTab friends={friends} isLoading={isLoading} />;
      default:
        return <UserProfile />;
    }
  };

  if (error) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full">
        <CardContent className="p-6 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white volter-font">❌ Erro ao Carregar</h3>
            <p className="text-white/80 text-sm">{error}</p>
          </div>
          <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto ml-12 h-[calc(100vh-12rem)] w-full max-w-[375px]">
      <div className="pixel-frame-outer h-full">
        <div className="pixel-header-bar">
          <div className="pixel-title">Console do Habbo</div>
          <div className="pixel-pattern"></div>
        </div>
        
        {/* Main content area */}
        <div className="pixel-inner-content">
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-hidden">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Tab navigation at bottom - now part of external frame */}
        <div className="bg-yellow-400 border-t-2 border-black">
          <div className="grid grid-cols-4 gap-0 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pixel-nav-button habbo-text-shadow",
                  activeTab === tab.id ? "active" : ""
                )}
                style={{
                  backgroundColor: activeTab === tab.id ? tab.activeColor : tab.color,
                  color: activeTab === tab.id ? '#2B2300' : '#000000'
                }}
              >
                <div className={cn(
                  "transition-transform duration-200",
                  activeTab === tab.id ? "scale-110" : "scale-100"
                )}>
                  {tab.icon}
                </div>
                <span className="leading-none text-[10px] font-bold">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



// Componente da aba Feed
const FeedTab: React.FC<any> = ({ badges, rooms, groups, friends, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 text-white/50 mx-auto animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent text-white border-0 shadow-none h-full">
      <CardHeader>
        <CardTitle className="text-lg">📰 Feed de Atividades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badges Activity */}
        {badges.length > 0 && (
          <div className="bg-white/10 p-4 rounded border border-black">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded flex items-center justify-center">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Beebop</span>
                  <span className="text-white/60 text-sm">ganhou {badges.length} emblemas</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Novos emblemas conquistados no Habbo!</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.slice(0, 3).map((badge) => (
                                       <span key={badge.code} className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                     {String(badge.code)}
                   </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooms Activity */}
        {rooms.length > 0 && (
          <div className="bg-white/10 p-4 rounded border border-black">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Beebop</span>
                  <span className="text-white/60 text-sm">tem {rooms.length} quartos</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Quartos criados e decorados no Habbo!</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {rooms.slice(0, 2).map((room) => (
                    <span key={room.id} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {room.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups Activity */}
        {groups.length > 0 && (
          <div className="bg-white/10 p-4 rounded border border-black">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Beebop</span>
                  <span className="text-white/60 text-sm">participa de {groups.length} grupos</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Membro ativo da comunidade Habbo!</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {groups.slice(0, 2).map((group) => (
                    <span key={group.id} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      {group.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Friends Activity */}
        {friends.length > 0 && (
          <div className="bg-white/10 p-4 rounded border border-black">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-pink-500 rounded flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Beebop</span>
                  <span className="text-white/60 text-sm">tem {friends.length} amigos</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Rede social ativa no Habbo!</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {friends.slice(0, 3).map((friend) => (
                    <span key={friend.uniqueId} className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">
                      {friend.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Activity Message */}
        {badges.length === 0 && rooms.length === 0 && groups.length === 0 && friends.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white/40 text-sm">
              <p>Nenhuma atividade disponível</p>
              <p className="mt-1">O perfil pode estar privado ou não ter conteúdo público</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente da aba Fotos
const PhotosTab: React.FC<any> = ({ badges, rooms, photos, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 text-white/50 mx-auto animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent text-white border-0 shadow-none h-full">
      <CardHeader>
        <CardTitle className="text-lg">📸 Fotos e Conquistas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photos Grid */}
        {photos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">Fotos ({photos.length})</h4>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group cursor-pointer">
                  <img 
                    src={photo.url} 
                    alt={photo.caption || 'Foto'} 
                    className="w-full h-24 object-cover rounded border border-black"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/photo-placeholder.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white text-xs p-2">
                      <div className="font-medium">{photo.type === 'SELFIE' ? '📸 Selfie' : '📷 Foto'}</div>
                      {photo.caption && (
                        <div className="text-white/80">{photo.caption}</div>
                      )}
                      <div className="text-white/60 mt-1">❤️ {photo.likes}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Grid */}
        {badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">Emblemas Conquistados ({badges.length})</h4>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div key={badge.code} className="relative group cursor-pointer">
                  <div className="w-full h-24 bg-yellow-500 rounded border border-black flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">{String(badge.code)}</div>
                      <div className="text-xs text-black/80 font-medium">{badge.name}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white text-xs p-2">
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-white/80">{badge.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {rooms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">Quartos Criados ({rooms.length})</h4>
            <div className="grid grid-cols-2 gap-3">
              {rooms.map((room) => (
                <div key={room.id} className="relative group cursor-pointer">
                  <div className="w-full h-24 bg-green-500/20 rounded border border-black flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium text-white">{room.name}</div>
                      <div className="text-xs text-white/60">{room.description}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white text-xs p-2">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-white/80">{room.description}</div>
                      <div className="text-white/60 mt-1">
                        ⭐ {room.rating} • {room.maximumVisitors} usuários
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Content Message */}
        {badges.length === 0 && rooms.length === 0 && photos.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white/40 text-sm">
              <p>Nenhum conteúdo disponível</p>
              <p className="mt-1">O perfil pode estar privado ou não ter conteúdo público</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente da aba Chat
const ChatTab: React.FC<any> = ({ friends, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 text-white/50 mx-auto animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent text-white border-0 shadow-none h-full">
      <CardHeader>
        <CardTitle className="text-lg">💬 Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.uniqueId} className="flex items-center space-x-3 p-3 bg-white/10 rounded border border-black hover:bg-white/20 transition-colors cursor-pointer">
            <div className="relative">
              <img 
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${friend.name}&size=s`}
                alt={friend.name}
                className="w-10 h-10 rounded"
              />
              <div className={cn(
                "absolute -bottom-1 -right-1 w-3 h-3 border border-black rounded-full",
                friend.online ? "bg-green-500" : "bg-red-500"
              )}></div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-white">{friend.name}</div>
              <div className="text-white/60 text-sm">{friend.motto}</div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Componente da aba Buscar
const SearchTab: React.FC<any> = ({ onStartConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Card className="bg-transparent text-white border-0 shadow-none h-full">
      <CardHeader>
        <CardTitle className="text-lg">🔍 Buscar Usuários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Digite o nome do usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-black rounded text-white placeholder-white/50"
          />
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center text-white/60 text-sm">
          <p>Busque por usuários do Habbo Hotel</p>
          <p>Digite o nome exato para encontrar</p>
        </div>
      </CardContent>
    </Card>
  );
};

