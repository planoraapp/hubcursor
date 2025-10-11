
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLatestHomes } from '@/hooks/useLatestHomes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { generateUniqueUsername } from '@/utils/usernameUtils';

// Funções auxiliares para processar background (mesma lógica do HomeCard)
const getHomeBackgroundUrl = (home: any) => {
  if (!home.background_value) return null;
  
  // Detectar automaticamente se é uma URL de imagem
  const isImageUrl = home.background_value.startsWith('http') || 
                    home.background_value.startsWith('/') ||
                    home.background_value.includes('.gif') ||
                    home.background_value.includes('.png') ||
                    home.background_value.includes('.jpg') ||
                    home.background_value.includes('.jpeg') ||
                    home.background_value.includes('.webp');
  
  // Se for uma URL de imagem, usar diretamente
  if (isImageUrl) {
    return `url(${home.background_value})`;
  }
  
  // Se for uma cor hexadecimal
  if (home.background_value.startsWith('#')) {
    return `linear-gradient(135deg, ${home.background_value} 0%, ${home.background_value}dd 100%)`;
  }
  
  // Se for um nome de background (como "bghabbohub"), tentar construir a URL
  if (home.background_value === 'bghabbohub') {
    return `url(/assets/bghabbohub.png)`;
  }
  
  // Fallback para o tipo definido
  switch (home.background_type) {
    case 'image':
      return `url(${home.background_value})`;
    case 'color':
      return `linear-gradient(135deg, ${home.background_value} 0%, ${home.background_value}dd 100%)`;
    case 'repeat':
      return `url(${home.background_value})`;
    case 'cover':
      return `url(${home.background_value})`;
    case 'default':
      // Para tipo "default", tentar construir a URL baseada no valor
      if (home.background_value === 'bghabbohub') {
        return `url(/assets/bghabbohub.png)`;
      }
      return `url(/assets/${home.background_value}.png)`;
    default:
      return null;
  }
};

const getBackgroundColor = (home: any) => {
  if (home.background_value?.startsWith('#')) {
    return home.background_value;
  }
  if (home.background_type === 'color' && home.background_value) {
    return home.background_value;
  }
  return '#c7d2dc'; // Cor padrão
};

const getBackgroundSize = (home: any) => {
  switch (home.background_type) {
    case 'repeat':
      return 'auto';
    case 'cover':
      return 'cover';
    default:
      return 'cover';
  }
};

const getBackgroundRepeat = (home: any) => {
  switch (home.background_type) {
    case 'repeat':
      return 'repeat';
    default:
      return 'no-repeat';
  }
};

export const LatestHomesCards: React.FC = () => {
  const { data: latestHomes, isLoading, error } = useLatestHomes();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-sm text-gray-600">Carregando últimas homes...</span>
      </div>
    );
  }

  if (error || !latestHomes || latestHomes.length === 0) {
    return null;
  }

  const handleHomeClick = (userId: string, habboName?: string, hotel?: string) => {
    if (habboName) {
      // Gerar nome único com prefixo do hotel
      const selectedHotel = hotel || 'br';
      const domainUsername = generateUniqueUsername(habboName, selectedHotel);
      window.open(`/home/${domainUsername}`, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {latestHomes.map((home) => (
        <Card 
          key={home.user_id} 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-300"
          onClick={() => handleHomeClick(home.user_id, home.habbo_name, home.hotel)}
        >
          <CardContent className="p-3">
            {/* Home Preview Miniature */}
            <div 
              className="w-full h-24 rounded-lg mb-3 relative overflow-hidden"
              style={{ 
                backgroundColor: getBackgroundColor(home),
                backgroundImage: getHomeBackgroundUrl(home),
                backgroundSize: getBackgroundSize(home),
                backgroundPosition: 'center',
                backgroundRepeat: getBackgroundRepeat(home)
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Home Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-800 truncate">
                {home.habbo_name || 'Usuário'}
              </h3>
              
              {/* Rating using StarRating component with starrating.png */}
              <StarRating 
                rating={4.2} // This should be calculated from actual ratings
                readonly={true}
                size="sm"
              />
              
              <p className="text-xs text-gray-600">
                {formatDistanceToNow(new Date(home.updated_at), { 
                  addSuffix: true,
                  locale: ptBR 
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
