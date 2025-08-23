import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Home, Clock } from 'lucide-react';

interface LatestHomeData {
  user_id: string;
  habbo_name?: string;
  updated_at: string;
  background_type?: string;
  background_value?: string;
  average_rating?: number;
  ratings_count?: number;
}

interface HomePreviewCardProps {
  home: LatestHomeData;
}

export const HomePreviewCard: React.FC<HomePreviewCardProps> = ({ home }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (home.habbo_name) {
      navigate(`/homes/${home.habbo_name}`);
    }
  };

  const getBackgroundStyle = () => {
    if (home.background_type === 'color') {
      return { backgroundColor: home.background_value || '#c7d2dc' };
    } else if (home.background_type === 'cover') {
      return {
        backgroundImage: `url(${home.background_value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else if (home.background_type === 'repeat') {
      return {
        backgroundImage: `url(${home.background_value})`,
        backgroundRepeat: 'repeat'
      };
    }
    return { backgroundColor: '#c7d2dc' };
  };

  const avatarUrl = home.habbo_name
    ? `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${home.habbo_name}&size=l&direction=2&head_direction=3&action=std`
    : null;

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 bg-white/95 backdrop-blur-sm border-2 border-black hover:shadow-2xl hover:shadow-black/20 relative overflow-hidden"
      onClick={handleClick}
    >
      <CardContent className="p-0 relative">
        {/* Home Background as Thumbnail */}
        <div 
          className="w-full h-40 relative overflow-hidden"
          style={getBackgroundStyle()}
        >
          {/* Gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          
          {/* Hover shadow effect */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
          
          {/* User Avatar - Larger and better positioned */}
          {avatarUrl && (
            <div className="absolute bottom-2 right-2 w-12 h-12 overflow-hidden">
              <img
                src={avatarUrl}
                alt={`Avatar de ${home.habbo_name}`}
                className="w-full h-full object-contain bg-transparent"
                style={{ 
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${home.habbo_name}&size=l&direction=2&head_direction=3&action=std`;
                }}
              />
            </div>
          )}
          
          {/* Username - Top Left with better contrast */}
          <div className="absolute top-2 left-2">
            <h3 className="font-bold text-sm text-white volter-font drop-shadow-lg truncate max-w-32"
                style={{ 
                  textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black, 2px 2px 4px rgba(0,0,0,0.8)'
                }}>
              {home.habbo_name || 'Usuário'}
            </h3>
          </div>
          
          {/* Hover Info Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm">
            <div className="text-center text-white space-y-2 p-4">
              {/* Rating */}
              {home.average_rating && home.average_rating > 0 ? (
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(home.average_rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                    />
                  ))}
                  <span className="text-sm text-white ml-1 volter-font">
                    {home.average_rating.toFixed(1)} ({home.ratings_count} avaliações)
                  </span>
                </div>
              ) : (
                <div className="text-sm text-white/70 volter-font">Sem avaliações ainda</div>
              )}
              
              {/* Last Updated */}
              <div className="flex items-center justify-center gap-1 text-xs text-white/90">
                <Clock className="w-3 h-3" />
                <span className="volter-font">
                  {formatDistanceToNow(new Date(home.updated_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </span>
              </div>
              
              <div className="text-xs text-white/70 volter-font">
                Clique para visitar
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};