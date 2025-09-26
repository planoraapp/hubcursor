import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Home, Users, UserCheck, Camera, X } from 'lucide-react';
import { useHabboPublicAPI } from '@/hooks/useHabboPublicAPI';
import { useAuth } from '@/hooks/useAuth';
import { BadgesModal } from './modals/BadgesModal';
import { RoomsModal } from './modals/RoomsModal';
import { FriendsModal } from './modals/FriendsModal';
import { GroupsModal } from './modals/GroupsModal';


interface UserProfileProps {
  username?: string;
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
  timestamp?: string;
  author?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
  const [modalStates, setModalStates] = useState({ badges: false, rooms: false, friends: false, groups: false });
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { habboAccount, isLoggedIn } = useAuth();
  
  // Usar o username do usuário logado se não for especificado
  const targetUsername = username || habboAccount?.habbo_name || 'Beebop';
  
  const { userData, badges, rooms, groups, friends, photos, isLoading, error, refreshData, refreshBadges, refreshRooms, refreshGroups, refreshFriends } = useHabboPublicAPI(targetUsername);

  // Debug para verificar se as fotos estão sendo carregadas
  // console.log(`🔍 [DEBUG] UserProfile (${targetUsername}) - photos:`, photos);

  // Função para formatar data no formato DD/MM/YYYY
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Função para determinar se o usuário está online (simulação baseada no último acesso)
  const isUserOnline = (): boolean => {
    if (!userData?.lastAccessTime) return false;
    try {
      const lastOnline = new Date(userData.lastAccessTime);
      const now = new Date();
      const diffInHours = (now.getTime() - lastOnline.getTime()) / (1000 * 60 * 60);
      // Considera online se o último acesso foi há menos de 1 hora
      return diffInHours < 1;
    } catch {
      return false;
    }
  };

  const openModal = (modalType: keyof typeof modalStates) => {
    setModalStates(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType: keyof typeof modalStates) => {
    setModalStates(prev => ({ ...prev, [modalType]: false }));
  };

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Carregando perfil...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erro ao carregar perfil: {error}</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Tentar novamente
          </button>
        </div>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card className="bg-transparent text-white border-0 shadow-none h-full flex items-center justify-center">
        <p className="text-white/60">Perfil não encontrado</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Header do Perfil */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-start gap-4">
            {/* Avatar à esquerda */}
            <div className="relative flex-shrink-0">
              <img
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userData.name}&size=m&direction=2&head_direction=3`}
                alt={`Avatar de ${userData.name}`}
                className="h-32 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${userData.name}&size=m&direction=2&head_direction=3`;
                }}
              />
              
              {/* Indicador de status online/offline - bolinha pixel art */}
              <div className="absolute bottom-2 right-2">
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                    isUserOnline() ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.8)'
                  }}
                />
              </div>
              
              {isLoggedIn && habboAccount?.habbo_name === userData.name && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Você
                </div>
              )}
            </div>
            
            {/* Nome e lema à direita do avatar */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2 truncate">{userData.name}</h2>
              <p className="text-white/70 italic mb-4 truncate">"{userData.motto}"</p>
              <div className="space-y-1 text-sm text-white/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-nowrap">Membro desde:</span>
                  <span className="truncate">{formatDate(userData.memberSince)}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-nowrap">Último online:</span>
                  <span className="truncate">{formatDate(userData.lastAccessTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Botões de Ação */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2">
            <button 
              onClick={() => openModal('badges')} 
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <Trophy className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-sm font-medium text-white">{badges?.length || 0}</div>
                <div className="text-xs text-white/60">Emblemas</div>
              </div>
            </button>
            
            <button 
              onClick={() => openModal('rooms')} 
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <Home className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-sm font-medium text-white">{rooms?.length || 0}</div>
                <div className="text-xs text-white/60">Quartos</div>
              </div>
            </button>
            
            <button 
              onClick={() => openModal('friends')} 
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <Users className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-sm font-medium text-white">{friends?.length || 0}</div>
                <div className="text-xs text-white/60">Amigos</div>
              </div>
            </button>
            
            <button 
              onClick={() => openModal('groups')} 
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <UserCheck className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-sm font-medium text-white">{groups?.length || 0}</div>
                <div className="text-xs text-white/60">Grupos</div>
              </div>
            </button>
          </div>
        </div>



        {/* Seção de Fotos Dinâmicas */}
        {photos && photos.length > 0 && (
          <div className="p-4 border-t border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Fotos ({photos?.length || 0})
            </h3>
          <div className="grid grid-cols-3">
            {photos?.map((photo, index) => (
              <div 
                key={photo.id} 
                className="relative group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="w-full h-20 bg-gray-700 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Foto ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-gray-700 rounded flex items-center justify-center text-white text-xs">📷</div>';
                      }
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                  <div className="text-center text-white text-xs p-2">
                    <div className="font-medium">📷 Foto</div>
                    {photo.caption && (
                      <div className="text-white/80 mt-1 truncate max-w-20">{photo.caption}</div>
                    )}
                    <div className="text-white/60 mt-1">📅 {formatDate(photo.takenOn)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </Card>

      {/* Modais */}
      <BadgesModal 
        badges={badges} 
        isOpen={modalStates.badges} 
        onClose={() => closeModal('badges')} 
      />
      <RoomsModal 
        rooms={rooms} 
        isOpen={modalStates.rooms} 
        onClose={() => closeModal('rooms')} 
      />
      <FriendsModal 
        friends={friends} 
        isOpen={modalStates.friends} 
        onClose={() => closeModal('friends')} 
      />
      <GroupsModal 
        groups={groups} 
        isOpen={modalStates.groups} 
        onClose={() => closeModal('groups')} 
      />

      {/* Modal de Foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-blue-500">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {selectedPhoto.type === 'SELFIE' ? '📸 Selfie' : '📷 Foto'}
              </h3>
              <button 
                onClick={closePhotoModal}
                className="text-white hover:bg-white/20 p-2 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="text-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || 'Foto'}
                  className="max-w-full max-h-[60vh] object-contain mx-auto rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-60 bg-gray-700 rounded flex items-center justify-center text-white text-lg">📷 Erro ao carregar foto</div>';
                    }
                  }}
                />
                {selectedPhoto.caption && (
                  <p className="text-white mt-4 text-lg">{selectedPhoto.caption}</p>
                )}
                <div className="flex items-center justify-center gap-4 mt-4 text-white/60">
                  <span>❤️ {selectedPhoto.likes} curtidas</span>
                  <span>📅 {formatDate(selectedPhoto.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Componente específico para Beebop (mantido para compatibilidade)
export const BeebopProfile: React.FC = () => {
  return <UserProfile username="Beebop" />;
};

