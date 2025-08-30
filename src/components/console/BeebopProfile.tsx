import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Home, Users, UserCheck } from 'lucide-react';
import { useHabboPublicAPI } from '@/hooks/useHabboPublicAPI';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { BadgesModal } from './modals/BadgesModal';
import { RoomsModal } from './modals/RoomsModal';
import { FriendsModal } from './modals/FriendsModal';
import { GroupsModal } from './modals/GroupsModal';

export const BeebopProfile: React.FC = () => {
  const [modalStates, setModalStates] = useState({ badges: false, rooms: false, friends: false, groups: false });
  const { userData, badges, rooms, groups, friends, photos, isLoading, error, refreshData, refreshBadges, refreshRooms, refreshGroups, refreshFriends } = useHabboPublicAPI('Beebop');
  const { currentUser, isLoggedIn } = useDirectAuth();

  const openModal = (modalType: keyof typeof modalStates) => {
    setModalStates(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType: keyof typeof modalStates) => {
    setModalStates(prev => ({ ...prev, [modalType]: false }));
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
        <div className="text-center p-6 border-b border-white/20">
          <div className="relative inline-block mb-4">
            <img
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userData.name}&size=l&direction=2&head_direction=3`}
              alt={`Avatar de ${userData.name}`}
              className="w-24 h-24 rounded-lg border-4 border-white/20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${userData.name}&size=l&direction=2&head_direction=3`;
              }}
            />
            {isLoggedIn && currentUser?.habbo_username === userData.name && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Você
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{userData.name}</h2>
          <p className="text-white/70 italic">"{userData.motto}"</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-white/60">
            <span>Membro desde: {userData.memberSince}</span>
            <span>•</span>
            <span>Último online: {userData.lastOnlineTime}</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="p-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{badges.length}</div>
              <div className="text-sm text-white/60">Emblemas</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{rooms.length}</div>
              <div className="text-sm text-white/60">Quartos</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{friends.length}</div>
              <div className="text-sm text-white/60">Amigos</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{groups.length}</div>
              <div className="text-sm text-white/60">Grupos</div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => openModal('badges')} 
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent border border-black hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <Trophy className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-sm font-medium text-white">{badges.length}</div>
                <div className="text-xs text-white/60">Emblemas</div>
              </div>
            </button>
            
            <button 
              onClick={() => openModal('rooms')} 
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent border border-black hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <Home className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-sm font-medium text-white">{rooms.length}</div>
                <div className="text-xs text-white/60">Quartos</div>
              </div>
            </button>
            
            <button 
              onClick={() => openModal('friends')} 
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent border border-black hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <Users className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-sm font-medium text-white">{friends.length}</div>
                <div className="text-xs text-white/60">Amigos</div>
              </div>
            </button>
            
            <button 
              onClick={() => openModal('groups')} 
              className="flex flex-col items-center justify-center gap-2 p-3 bg-transparent border border-black hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <UserCheck className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-sm font-medium text-white">{groups.length}</div>
                <div className="text-xs text-white/60">Grupos</div>
              </div>
            </button>
          </div>
        </div>

        {/* Seção de Emblemas Selecionados */}
        {badges.length > 0 && (
          <div className="p-6 border-t border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Emblemas em Destaque</h3>
            <div className="grid grid-cols-3 gap-3">
              {badges.slice(0, 6).map((badge, index) => (
                <div key={index} className="text-center">
                  <img
                    src={`https://images.habbo.com/c_images/album1584/${String(badge.code)}.gif`}
                    alt={badge.name}
                    className="w-12 h-12 mx-auto mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/badge-placeholder.png';
                    }}
                  />
                  <p className="text-xs text-white/80 truncate">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Quartos Recentes */}
        {rooms.length > 0 && (
          <div className="p-6 border-t border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Quartos Recentes</h3>
            <div className="space-y-2">
              {rooms.slice(0, 3).map((room, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{room.name}</p>
                    <p className="text-xs text-white/60">{room.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Grupos */}
        {groups.length > 0 && (
          <div className="p-6 border-t border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Grupos</h3>
            <div className="space-y-2">
              {groups.slice(0, 3).map((group, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                  <img
                    src={group.badgeUrl}
                    alt={group.name}
                    className="w-8 h-8"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/group-placeholder.png';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{group.name}</p>
                    <p className="text-xs text-white/60">{group.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Amigos */}
        {friends.length > 0 && (
          <div className="p-6 border-t border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Amigos Online</h3>
            <div className="grid grid-cols-4 gap-2">
              {friends.slice(0, 8).map((friend, index) => (
                <div key={index} className="text-center">
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${friend.name}&size=s&direction=2&head_direction=3&headonly=1`}
                    alt={friend.name}
                    className="w-10 h-10 mx-auto mb-1 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${friend.name}&size=s&direction=2&head_direction=3&headonly=1`;
                    }}
                  />
                  <p className="text-xs text-white/80 truncate">{friend.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Fotos - Agora posicionada após Amigos Online */}
        {photos.length > 0 && (
          <div className="p-6 border-t border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Fotos ({photos.length})</h3>
            <div className="grid grid-cols-3 gap-3">
              {photos.slice(0, 9).map((photo, index) => (
                <div key={photo.id} className="relative group cursor-pointer">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Foto ${index + 1}`}
                    className={`w-full h-24 object-cover rounded border border-white/20 transition-transform group-hover:scale-105 ${
                      photo.contentWidth > photo.contentHeight ? 'col-span-2' : ''
                    }`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/photo-placeholder.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white text-xs p-2">
                      <div className="font-medium">{photo.type === 'SELFIE' ? '📸 Selfie' : '📷 Foto'}</div>
                      {photo.caption && (
                        <div className="text-white/80 mt-1">{photo.caption}</div>
                      )}
                      <div className="text-white/60 mt-1">❤️ {photo.likes}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {photos.length > 9 && (
              <div className="text-center mt-3">
                <p className="text-white/60 text-sm">+{photos.length - 9} fotos adicionais</p>
              </div>
            )}
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
    </>
  );
};
