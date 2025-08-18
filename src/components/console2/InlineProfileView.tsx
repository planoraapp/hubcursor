import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Camera, Trophy, Home, Users, Crown, MessageSquare, Loader2 } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useOptimizedPhotos } from '@/hooks/useOptimizedPhotos';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';

interface InlineProfileViewProps {
  habboName: string;
  onBack: () => void;
}

export const InlineProfileView: React.FC<InlineProfileViewProps> = ({ 
  habboName, 
  onBack 
}) => {
  const consoleProfile = useMyConsoleProfile();
  const photosData = useOptimizedPhotos(habboName);
  const { data: completeProfile, isLoading: completeLoading } = useCompleteProfile(habboName);

  const profileData = consoleProfile.myProfile;
  const photos = photosData.photos || [];
  const photosLoading = photosData.isLoading;
  const profileLoading = consoleProfile.isLoading;

  const handleRefreshPhotos = async () => {
    await photosData.loadPhotos(true);
  };

  if (profileLoading || completeLoading) {
    return (
      <Card className="bg-[#3D4852] text-white border-0 shadow-none h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onBack}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Perfil do Usuário
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
        </CardContent>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Card className="bg-[#3D4852] text-white border-0 shadow-none h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onBack}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Usuário não encontrado
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-[#3D4852] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            {profileData.name}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {/* Avatar e informações básicas */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center gap-4 mb-3">
            <img
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${profileData.name}&size=l&direction=2&head_direction=3`}
              alt={`Avatar de ${profileData.name}`}
              className="w-16 h-16 bg-transparent"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{profileData.name}</h3>
              <p className="text-white/80">{profileData.motto || 'Sem motto'}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${profileData.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-white/60 text-sm">
                  {profileData.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas sociais */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Camera className="w-5 h-5 mx-auto mb-1 text-white/60" />
            <div className="text-lg font-bold text-white">{photos.length}</div>
            <div className="text-xs text-white/60">Fotos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <MessageSquare className="w-5 h-5 mx-auto mb-1 text-white/60" />
            <div className="text-lg font-bold text-white">0</div>
            <div className="text-xs text-white/60">Seguindo</div>
          </div>
        </div>

        {/* Estatísticas detalhadas */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost" 
            className="bg-white/10 hover:bg-white/20 text-white p-3 h-auto flex-col gap-1"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-bold">0</span>
            <span className="text-xs text-white/60">Emblemas</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white p-3 h-auto flex-col gap-1"
          >
            <Home className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-bold">0</span>
            <span className="text-xs text-white/60">Quartos</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white p-3 h-auto flex-col gap-1"
          >
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-lg font-bold">0</span>
            <span className="text-xs text-white/60">Amigos</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white p-3 h-auto flex-col gap-1"
          >
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-bold">0</span>
            <span className="text-xs text-white/60">Grupos</span>
          </Button>
        </div>

        {/* Fotos */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">Fotos ({photos.length})</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefreshPhotos}
              disabled={photosLoading}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Atualizar
            </Button>
          </div>
          
          {photosLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            </div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60">Nenhuma foto encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};