import React, { useState, useEffect } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FunctionalRatingWidgetProps {
  homeOwnerId: string;
}

export const FunctionalRatingWidget: React.FC<FunctionalRatingWidgetProps> = ({
  homeOwnerId
}) => {
  const [currentRating, setCurrentRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const { habboAccount } = useAuth();

  useEffect(() => {
    loadRatings();
  }, [homeOwnerId]);

  const loadRatings = async () => {
    try {
      // Carregar todas as avaliações para calcular média
      const { data: allRatings, error: allError } = await supabase
        .from('user_home_ratings')
        .select('rating')
        .eq('home_owner_user_id', homeOwnerId);

      if (!allError && allRatings) {
        const ratings = allRatings.map(r => r.rating);
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        setAverageRating(Math.round(avg * 10) / 10);
        setTotalRatings(ratings.length);
      }

      // Carregar avaliação do usuário atual se logado
      if (habboAccount) {
        const { data: userRatingData, error: userError } = await supabase
          .from('user_home_ratings')
          .select('rating')
          .eq('home_owner_user_id', homeOwnerId)
          .eq('rating_user_id', habboAccount.supabase_user_id)
          .single();

        if (!userError && userRatingData) {
          setUserRating(userRatingData.rating);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    }
  };

  const handleRate = async (rating: number) => {
    if (!habboAccount) return;

    try {
      const { error } = await supabase
        .from('user_home_ratings')
        .upsert({
          home_owner_user_id: homeOwnerId,
          rating_user_id: habboAccount.supabase_user_id,
          rating
        });

      if (!error) {
        setUserRating(rating);
        await loadRatings(); // Recarregar para atualizar média
      }
    } catch (error) {
      console.error('Erro ao avaliar:', error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white border-2 border-black rounded-md font-volter min-h-[120px]">
      {/* Média no topo */}
      <div className="text-2xl font-bold text-black mb-2">
        {averageRating.toFixed(1)}
      </div>
      
      {/* Estrelas centralizadas */}
      <div className="mb-2">
        <StarRating
          rating={habboAccount ? userRating : averageRating}
          onRate={habboAccount ? handleRate : undefined}
          readonly={!habboAccount}
          size="lg"
        />
      </div>
      
      {/* Contador de avaliações */}
      <div className="text-xs text-gray-600">
        {totalRatings} {totalRatings === 1 ? 'avaliação' : 'avaliações'}
      </div>
      
      {!habboAccount && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          Faça login para avaliar
        </div>
      )}
    </div>
  );
};