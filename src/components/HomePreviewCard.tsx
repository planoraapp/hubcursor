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

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/95 backdrop-blur-sm border-2 border-black"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Miniatura da Home */}
        <div 
          className="w-full h-32 relative overflow-hidden border-b-2 border-black"
          style={getBackgroundStyle()}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Ícone de Home no canto */}
          <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1">
            <Home className="w-4 h-4 text-white" />
          </div>
          
          {/* Indicador de atividade recente */}
          <div className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white volter-font">
            ● Editada
          </div>
        </div>

        {/* Informações da Home */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg text-gray-800 volter-font truncate">
            {home.habbo_name || 'Usuário'}
          </h3>
          
          {/* Rating fictício por enquanto */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1 volter-font">4.0</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span className="volter-font">
              {formatDistanceToNow(new Date(home.updated_at), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};