
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, MapPin, Users, Image, Trophy, Loader2 } from 'lucide-react';
import { optimizedFeedService } from '@/services/optimizedFeedService';

interface InlineProfileViewProps {
  habboName: string;
  onBack: () => void;
}

export const InlineProfileView: React.FC<InlineProfileViewProps> = ({
  habboName,
  onBack
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`[InlineProfileView] Fetching profile for: ${habboName}`);
        const profileData = await optimizedFeedService.getProfile(habboName);
        
        if (profileData) {
          setProfile(profileData);
          console.log(`[InlineProfileView] Profile loaded successfully`);
        } else {
          setError('Perfil não encontrado');
        }
      } catch (err) {
        console.error('[InlineProfileView] Error fetching profile:', err);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    if (habboName) {
      fetchProfile();
    }
  }, [habboName]);

  return (
    <Card className="bg-[#3D4852] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
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
      
      <CardContent className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-red-300">{error}</p>
            <Button
              variant="outline"
              onClick={onBack}
              className="mt-4 border-white/20 text-white hover:bg-white/10"
            >
              Voltar
            </Button>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Avatar e Info Principal - Avatar sem borda circular */}
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto">
                <img
                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${profile.habbo_name}&size=l&direction=2&head_direction=3`}
                  alt={`Avatar de ${profile.habbo_name}`}
                  className="w-full h-full object-contain bg-transparent"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${profile.habbo_name}&size=l&direction=2&head_direction=3`;
                  }}
                />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white">{profile.habbo_name}</h2>
                <p className="text-white/60 text-sm mt-1">{profile.motto || 'Sem motto'}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant={profile.is_online ? "default" : "secondary"} className="text-xs">
                    {profile.is_online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <div className="text-lg font-bold">{profile.friends_count || 0}</div>
                <div className="text-xs text-white/60">Amigos</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <Image className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <div className="text-lg font-bold">{profile.photos_count || 0}</div>
                <div className="text-xs text-white/60">Fotos</div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-3">
              {profile.member_since && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-white/60" />
                  <span className="text-white/80">
                    Membro desde {new Date(profile.member_since).getFullYear()}
                  </span>
                </div>
              )}
              
              {profile.hotel && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-white/60" />
                  <span className="text-white/80">Hotel: {profile.hotel.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Emblemas */}
            {profile.badges && profile.badges.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Emblemas
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {profile.badges.slice(0, 8).map((badge: any, index: number) => (
                    <div key={index} className="bg-white/10 rounded p-2 text-center">
                      <img
                        src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                        alt={badge.name}
                        className="w-6 h-6 mx-auto"
                        title={badge.name}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
