
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, MapPin, Trophy } from 'lucide-react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { unifiedHabboService } from '@/services/unifiedHabboService';
interface HabboProfile {
  name: string;
  motto: string;
  figureString: string;
  online: boolean;
  memberSince: string;
  selectedBadges: any[];
  totalBadges: number;
}

const ProfileEnhanced = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<HabboProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const profileData = await unifiedHabboService.getUserProfile(username);
        if (profileData) {
          // Transform HabboUser to HabboProfile format
          const transformedProfile: HabboProfile = {
            name: profileData.name,
            motto: profileData.motto,
            figureString: profileData.figureString,
            online: profileData.online,
            memberSince: profileData.memberSince,
            selectedBadges: profileData.selectedBadges || [],
            totalBadges: profileData.badges?.length || 0,
          };
          setProfile(transformedProfile);
        } else {
          setError('Perfil não encontrado');
        }
      } catch (err) {
                setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <NewAppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <NewAppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">{error || 'Perfil não encontrado'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const avatarUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${profile.figureString}&size=l&direction=2&head_direction=3`;

  return (
    <div className="flex h-screen bg-gray-50">
      <NewAppSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Perfil Enhanced</h1>
            <p className="text-gray-600">Visualização detalhada do perfil</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="text-center py-6">
                  <div className="w-32 h-32 mx-auto mb-4">
                    <img
                      src={avatarUrl}
                      alt={`Avatar de ${profile.name}`}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                  <p className="text-gray-600 mb-4">{profile.motto}</p>
                  <Badge variant={profile.online ? "default" : "secondary"}>
                    {profile.online ? '🟢 Online' : '🔴 Offline'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Informações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Membro desde: {new Date(profile.memberSince).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Total de emblemas: {profile.totalBadges}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              {profile.selectedBadges && profile.selectedBadges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Emblemas Favoritos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {profile.selectedBadges.map((badge, index) => (
                        <div key={index} className="text-center">
                          <img
                            src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                            alt={badge.name}
                            className="w-12 h-12 mx-auto mb-1"
                            title={badge.name}
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <p className="text-xs text-gray-600 truncate">{badge.name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEnhanced;
