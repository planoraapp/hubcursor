
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarDays, 
  Home, 
  Trophy, 
  Users, 
  Crown, 
  Heart,
  MessageSquare,
  UserPlus,
  Camera,
  X,
  ExternalLink 
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PhotoModal } from './PhotoModal';

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
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="flex items-start gap-4">
        <Avatar className="w-20 h-20 border-2 border-gray-600">
          <AvatarImage 
            src={avatarUrl}
            style={{ imageRendering: 'pixelated' }}
          />
          <AvatarFallback className="bg-gray-600 text-white text-xl">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white mb-1">{habboUser?.habbo_name || username}</h2>
          {habboUser?.motto && (
            <p className="text-gray-300 italic mb-2">"{habboUser.motto}"</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Badge className={habboUser?.is_online ? 'bg-green-600' : 'bg-red-600'}>
              {habboUser?.is_online ? 'Online' : 'Offline'}
            </Badge>
            {habboUser?.hotel && (
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                Hotel {habboUser.hotel.toUpperCase()}
              </Badge>
            )}
          </div>
          {habboUser?.created_at && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <CalendarDays className="w-4 h-4" />
              <span>Membro desde: {formatDate(habboUser.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="default" className="flex-1">
          <UserPlus className="w-4 h-4 mr-2" />
          Seguir
        </Button>
        <Button variant="outline" className="flex-1 border-gray-600 text-gray-300">
          <MessageSquare className="w-4 h-4 mr-2" />
          Mensagem
        </Button>
        <Button variant="outline" size="icon" className="border-gray-600 text-gray-300">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{stats.badgesCount}</div>
          <div className="text-sm text-gray-400">Emblemas</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <Camera className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{stats.photosCount}</div>
          <div className="text-sm text-gray-400">Fotos</div>
        </div>
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Emblemas ({stats.badgesCount})</h3>
      {habboProfile?.selectedBadges && habboProfile.selectedBadges.length > 0 ? (
        <div className="grid grid-cols-6 gap-3">
          {habboProfile.selectedBadges.map((badge: any, index: number) => (
            <div 
              key={index} 
              className="bg-gray-700/50 rounded-lg p-2 flex flex-col items-center hover:bg-gray-600/50 transition-colors"
              title={badge.name || badge.code}
            >
              <img 
                src={`https://images.habbo.com/c_images/album1584/${badge.code}.png`}
                alt={badge.name || badge.code}
                className="w-8 h-8 mb-1"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.currentTarget.src = `https://images.habbo.com/c_images/album1584/${badge.code}.gif`;
                }}
              />
              <span className="text-xs text-gray-400 text-center truncate w-full">
                {badge.name || badge.code}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-500" />
          <p className="text-gray-400">Nenhum emblema selecionado</p>
        </div>
      )}
    </div>
  );

  const renderPhotos = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Fotos ({stats.photosCount})</h3>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              className="relative bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-600/50 transition-colors cursor-pointer"
              onClick={() => setSelectedPhoto({
                id: photo.id,
                imageUrl: photo.url,
                date: new Date().toLocaleDateString('pt-BR'),
                likes: photo.likes_count || 0
              })}
            >
              <img
                src={photo.url}
                alt="Foto do Habbo"
                className="w-full aspect-square object-cover"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{photo.likes_count || 0}</span>
                  </div>
                  {photo.room_name && (
                    <span className="truncate ml-2">{photo.room_name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Camera className="w-12 h-12 mx-auto mb-2 text-gray-500" />
          <p className="text-gray-400">Nenhuma foto encontrada</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl h-[80vh] p-0 bg-gray-800 border-gray-700">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">
                Perfil de {username}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : !habboUser ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="text-6xl mb-4">😞</div>
              <p className="text-gray-400 mb-2">Usuário não encontrado</p>
              <p className="text-sm text-gray-500">
                O perfil pode estar privado ou o usuário não existe
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="flex border-b border-gray-700 px-6">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: Users },
                  { id: 'badges', label: 'Emblemas', icon: Trophy },
                  { id: 'photos', label: 'Fotos', icon: Camera }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'badges' && renderBadges()}
                {activeTab === 'photos' && renderPhotos()}
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photo={selectedPhoto}
        />
      )}
    </>
  );
};
