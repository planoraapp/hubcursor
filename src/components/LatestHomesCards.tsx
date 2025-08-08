
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLatestHomes } from '@/hooks/useLatestHomes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';

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
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma home encontrada no momento.</p>
      </div>
    );
  }

  const handleHomeClick = (userId: string, habboName?: string) => {
    if (habboName) {
      window.open(`/home/${habboName}`, '_blank');
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🏠 Últimas Homes Atualizadas</h2>
        <Badge variant="secondary" className="text-sm">
          Atualizadas recentemente
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {latestHomes.map((home) => (
          <Card 
            key={home.user_id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-300"
            onClick={() => handleHomeClick(home.user_id, home.habbo_name)}
          >
            <CardContent className="p-4">
              {/* Home Preview */}
              <div 
                className="w-full h-32 rounded-lg mb-3 relative overflow-hidden"
                style={{ 
                  backgroundColor: home.background_value || '#c7d2dc',
                  backgroundImage: home.background_type === 'image' 
                    ? `url(${home.background_value})` 
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-white/90 text-gray-800 text-xs">
                    Home Preview
                  </Badge>
                </div>
              </div>

              {/* Home Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 truncate">
                  {home.habbo_name || 'Usuário Anônimo'}
                </h3>
                
                {/* Rating */}
                <StarRating 
                  rating={4.2} // You can implement actual rating calculation
                  readonly={true}
                  size="sm"
                />
                
                <p className="text-xs text-gray-600">
                  Atualizada {formatDistanceToNow(new Date(home.updated_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Ativa
                  </Badge>
                  <span className="text-xs text-blue-600 hover:underline">
                    Visitar →
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
