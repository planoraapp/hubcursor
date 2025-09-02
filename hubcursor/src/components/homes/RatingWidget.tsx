
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface RatingWidgetProps {
  homeOwnerUserId: string;
  homeOwnerName: string;
}

export const RatingWidget: React.FC<RatingWidgetProps> = ({ 
  homeOwnerUserId, 
  homeOwnerName 
}) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, habboAccount } = useUnifiedAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRatings();
    if (user) {
      loadUserRating();
    }
  }, [homeOwnerUserId, user]);

  const loadRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_home_ratings')
        .select('rating')
        .eq('home_owner_user_id', homeOwnerUserId);

      if (error) throw error;

      if (data && data.length > 0) {
        const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Number(average.toFixed(1)));
        setTotalRatings(data.length);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const loadUserRating = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_home_ratings')
        .select('rating')
        .eq('home_owner_user_id', homeOwnerUserId)
        .eq('rating_user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setUserRating(data?.rating || 0);
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user || !habboAccount) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para avaliar esta home.",
        variant: "destructive"
      });
      return;
    }

    if (user.id === homeOwnerUserId) {
      toast({
        title: "Avaliação não permitida",
        description: "Você não pode avaliar sua própria home.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (userRating > 0) {
        // Update existing rating
        const { error } = await supabase
          .from('user_home_ratings')
          .update({ rating })
          .eq('home_owner_user_id', homeOwnerUserId)
          .eq('rating_user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('user_home_ratings')
          .insert({
            home_owner_user_id: homeOwnerUserId,
            rating_user_id: user.id,
            rating
          });

        if (error) throw error;
      }

      setUserRating(rating);
      await loadRatings();

      toast({
        title: "Avaliação enviada!",
        description: `Você avaliou a home de ${homeOwnerName} com ${rating} estrela${rating !== 1 ? 's' : ''}.`
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Erro ao avaliar",
        description: "Não foi possível salvar sua avaliação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-gray-300 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        Avalie esta Home
      </h3>
      
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-yellow-600">
          {averageRating > 0 ? averageRating : '—'}
        </div>
        <div className="flex justify-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              className={`${
                star <= averageRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-600">
          {totalRatings} avaliação{totalRatings !== 1 ? 'ões' : ''}
        </div>
      </div>

      {user && user.id !== homeOwnerUserId && (
        <div className="border-t pt-3">
          <p className="text-sm text-gray-600 mb-2">Sua avaliação:</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={isLoading}
                className="p-1 hover:scale-110 transition-transform disabled:opacity-50"
              >
                <Star
                  size={24}
                  className={`${
                    star <= (hoveredRating || userRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  } cursor-pointer`}
                />
              </button>
            ))}
          </div>
          {userRating > 0 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Você avaliou com {userRating} estrela{userRating !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {!user && (
        <div className="border-t pt-3 text-center">
          <p className="text-sm text-gray-500">
            Faça login para avaliar esta home
          </p>
        </div>
      )}
    </div>
  );
};
