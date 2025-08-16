
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MessageCircle, UserPlus, Camera, RefreshCw, Loader2, Clock, ArrowLeft, X, Trophy, Users, Home, Crown } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BadgesModal } from './modals/BadgesModal';
import { FriendsModal } from './modals/FriendsModal';
import { RoomsModal } from './modals/RoomsModal';
import { GroupsModal } from './modals/GroupsModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  username
}) => {
  const { habboUser, habboProfile, photos, avatarUrl, stats, isLoading } = useUserProfile(username);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-gray-900 border-gray-700 text-white">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!habboUser) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-gray-900 border-gray-700 text-white">
          <div className="text-center py-12">
            <p className="text-gray-400">Usuário não encontrado</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-gray-900 border-gray-700 text-white p-0 overflow-hidden">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Perfil do Usuário</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <Card className="mb-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-4 border-white/20">
                      <AvatarImage src={avatarUrl} alt={`Avatar de ${habboUser.habbo_name}`} />
                      <AvatarFallback className="bg-white/20 text-white text-lg">
                        {habboUser.habbo_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{habboUser.habbo_name}</h3>
                      <p className="text-white/80 italic">"{habboUser.motto || 'Sem motto'}"</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${habboUser.is_online ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                          {habboUser.is_online ? 'Online' : 'Offline'}
                        </Badge>
                        <Badge variant="outline" className="text-white border-white/30">
                          {habboUser.hotel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Button
                  variant="ghost"
                  className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white h-auto"
                  onClick={() => setActiveModal('badges')}
                >
                  <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
                  <span className="text-2xl font-bold">{stats.badgesCount}</span>
                  <span className="text-xs text-gray-400">Emblemas</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white h-auto"
                  onClick={() => setActiveModal('friends')}
                >
                  <Users className="w-6 h-6 text-blue-400 mb-2" />
                  <span className="text-2xl font-bold">{stats.friendsCount || '?'}</span>
                  <span className="text-xs text-gray-400">Amigos</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white h-auto"
                  onClick={() => setActiveModal('rooms')}
                >
                  <Home className="w-6 h-6 text-purple-400 mb-2" />
                  <span className="text-2xl font-bold">{stats.groupsCount || '?'}</span>
                  <span className="text-xs text-gray-400">Quartos</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white h-auto"
                  onClick={() => setActiveModal('groups')}
                >
                  <Crown className="w-6 h-6 text-orange-400 mb-2" />
                  <span className="text-2xl font-bold">{stats.groupsCount || '?'}</span>
                  <span className="text-xs text-gray-400">Grupos</span>
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Heart className="w-4 h-4 mr-1" />
                  Curtir
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Comentar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Seguir
                </Button>
              </div>

              {/* Photos Section */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Camera className="w-5 h-5" />
                    Fotos ({stats.photosCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {photos.slice(0, 6).map((photo, index) => (
                        <div key={photo.id || index} className="aspect-square relative group">
                          <img
                            src={photo.url}
                            alt={`Foto ${index + 1} de ${habboUser.habbo_name}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-600"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-2">
                            <div className="text-white text-xs">
                              {photo.likes_count > 0 && (
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {photo.likes_count}
                                </div>
                              )}
                              {photo.room_name && (
                                <div className="mt-1 truncate">{photo.room_name}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm text-gray-400">Nenhuma foto encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Badges Preview */}
              {habboProfile?.selectedBadges && habboProfile.selectedBadges.length > 0 && (
                <Card className="mt-6 bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Emblemas Selecionados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {habboProfile.selectedBadges.slice(0, 8).map((badge, index) => (
                        <div key={index} className="text-center">
                          <img
                            src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                            alt={badge.name}
                            className="w-12 h-12 mx-auto mb-1"
                            style={{ imageRendering: 'pixelated' }}
                            title={`${badge.name}: ${badge.description}`}
                          />
                          <p className="text-xs text-gray-400 truncate">
                            {badge.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <BadgesModal
        isOpen={activeModal === 'badges'}
        onClose={() => setActiveModal(null)}
        badges={habboProfile?.selectedBadges || []}
        userName={habboUser.habbo_name}
      />
      
      <FriendsModal
        isOpen={activeModal === 'friends'}
        onClose={() => setActiveModal(null)}
        friends={[]} // TODO: Implement friends data
        userName={habboUser.habbo_name}
      />
      
      <RoomsModal
        isOpen={activeModal === 'rooms'}
        onClose={() => setActiveModal(null)}
        rooms={[]} // TODO: Implement rooms data
        userName={habboUser.habbo_name}
      />
      
      <GroupsModal
        isOpen={activeModal === 'groups'}
        onClose={() => setActiveModal(null)}
        groups={[]} // TODO: Implement groups data
        userName={habboUser.habbo_name}
      />
    </>
  );
};
