
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
            // Verificar se homeOwnerId é válido
      if (!homeOwnerId || homeOwnerId === 'undefined') {
        console.warn('⭐ homeOwnerId inválido:', homeOwnerId);
                setLoading(false);
        return;
      }

      console.log('⭐ Carregando avaliações para home:', homeOwnerId);

      // Carregar todas as avaliações para calcular média
      const { data: allRatings, error: allError } = await supabase
        .from('user_home_ratings')
        .select('rating')
        .eq('home_owner_user_id', homeOwnerId);

      if (allError) {
        console.error('⭐ Erro ao carregar avaliações:', allError);
              } else if (allRatings) {
        const ratings = allRatings.map(r => r.rating);
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        setAverageRating(Math.round(avg * 10) / 10);
        setTotalRatings(ratings.length);
        
        console.log(`📊 Média calculada: ${avg.toFixed(1)} (${ratings.length} votos)`);
      }

      // Carregar avaliação do usuário atual se logado
      if (habboAccount && habboAccount.supabase_user_id) {
        console.log('⭐ Buscando avaliação do usuário:', {
          homeOwnerId,
          ratingUserId: habboAccount.supabase_user_id
        });

        const { data: userRatingData, error: userError } = await supabase
          .from('user_home_ratings')
          .select('rating')
          .eq('home_owner_user_id', homeOwnerId)
          .eq('rating_user_id', habboAccount.supabase_user_id)
          .maybeSingle();

        if (userError) {
          console.error('⭐ Erro ao buscar avaliação do usuário:', userError);
        } else if (userRatingData) {
          setUserRating(userRatingData.rating);
          console.log('⭐ Avaliação do usuário encontrada:', userRatingData.rating);
        } else {
          console.log('⭐ Usuário ainda não avaliou esta home');
        }
      }
    } catch (error) {
      console.error('⭐ Erro geral ao carregar avaliações:', error);
          } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!habboAccount || !habboAccount.supabase_user_id) {
      console.warn('⭐ Usuário não autenticado ou sem supabase_user_id:', habboAccount);
      return;
    }

    // Não permitir que o usuário avalie sua própria home
    if (habboAccount.supabase_user_id === homeOwnerId) {
      console.warn('⭐ Usuário não pode avaliar sua própria home');
      return;
    }

    try {
      console.log('⭐ Enviando avaliação:', {
        home_owner_user_id: homeOwnerId,
        rating_user_id: habboAccount.supabase_user_id,
        rating,
        habbo_name: habboAccount.habbo_name
      });

      const { data, error } = await supabase
        .from('user_home_ratings')
        .upsert({
          home_owner_user_id: homeOwnerId,
          rating_user_id: habboAccount.supabase_user_id,
          rating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'rating_user_id,home_owner_user_id'
        })
        .select();

      if (error) {
        console.error('❌ Erro ao salvar avaliação:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details
        });
      } else {
        setUserRating(rating);
        await loadRatings(); // Recarregar para atualizar média
        console.log('✅ Avaliação salva com sucesso!', data);
      }
    } catch (error) {
      console.error('❌ Erro ao avaliar:', error);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-md volter-font ${className}`}
           style={{ width: '200px', height: '180px' }}>
        <div className="text-xs text-gray-500 volter-font">Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-md volter-font ${className}`}
         style={{ width: '200px', height: '180px' }}>
      {/* Média com fonte Volter Goldfish */}
      <div 
        className="text-2xl font-bold mb-2 volter-goldfish-font"
        style={{
          color: 'white',
          textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 0px -2px 0px #000, 2px 0px 0px #000, -2px 0px 0px #000'
        }}
      >
        {averageRating.toFixed(1)}
      </div>
      
      {/* Estrelas - mostra média mas permite votar se logado */}
      <div className="mb-3">
        <StarRating
          rating={habboAccount ? userRating : averageRating}
          onRate={habboAccount ? handleRate : undefined}
          readonly={!habboAccount}
          size="md"
        />
      </div>
      
      {/* Contador de votos */}
      <div className="text-xs text-gray-600 text-center volter-font">
        {totalRatings === 0 
          ? 'Sem avaliações' 
          : `${totalRatings} ${totalRatings === 1 ? 'voto' : 'votos'}`
        }
      </div>
      
      {!habboAccount && (
        <div className="text-[10px] text-gray-500 mt-2 text-center volter-font">
          Login para avaliar
        </div>
      )}
    </div>
  );
};
