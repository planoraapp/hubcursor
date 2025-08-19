
import React, { useState, useEffect } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RatingWidgetProps {
  homeOwnerId: string;
  className?: string;
}

export const RatingWidget: React.FC<RatingWidgetProps> = ({
  homeOwnerId,
  className = ''
}) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const { habboAccount } = useAuth();

  useEffect(() => {
    loadRatings();
  }, [homeOwnerId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      console.log('🌟 Carregando avaliações para:', homeOwnerId);

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
        
        console.log(`📊 Média calculada: ${avg.toFixed(1)} (${ratings.length} votos)`);
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
          console.log(`👤 Avaliação do usuário: ${userRatingData.rating}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!habboAccount) {
      console.warn('⚠️ Usuário não logado tentando avaliar');
      return;
    }

    try {
      console.log(`⭐ Avaliando com ${rating} estrelas`);
      
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
        console.log('✅ Avaliação salva com sucesso');
      } else {
        console.error('❌ Erro ao salvar avaliação:', error);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao avaliar:', error);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center p-4 bg-white border-2 border-black rounded-md font-volter min-h-[120px] justify-center ${className}`}>
        <div className="text-sm text-gray-500">Carregando avaliações...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center p-4 bg-white border-2 border-black rounded-md font-volter min-h-[120px] ${className}`}>
      {/* Média no topo */}
      <div className="text-2xl font-bold text-black mb-2">
        {averageRating > 0 ? averageRating.toFixed(1) : '—'}
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
      <div className="text-xs text-gray-600 text-center">
        {totalRatings === 0 
          ? 'Nenhuma avaliação' 
          : `${totalRatings} ${totalRatings === 1 ? 'avaliação' : 'avaliações'}`
        }
      </div>
      
      {!habboAccount && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          Faça login para avaliar
        </div>
      )}
    </div>
  );
};
