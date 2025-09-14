import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';

interface FunctionalRatingWidgetProps {
  homeOwnerUserId: string;
  homeOwnerName: string;
}

export const FunctionalRatingWidget: React.FC<FunctionalRatingWidgetProps> = ({
  homeOwnerUserId,
  homeOwnerName
}) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { habboAccount } = useUnifiedAuth();
  const { toast } = useToast();
  
  const isLoggedIn = !!habboAccount;
  const isOwner = habboAccount?.supabase_user_id === homeOwnerUserId;

  useEffect(() => {
    loadRatings();
    if (isLoggedIn && !isOwner) {
      loadUserRating();
    }
  }, [homeOwnerUserId, habboAccount]);

  const loadRatings = async () => {
    try {
      const { data: ratings, error } = await supabase
        .from('user_home_ratings')
        .select('rating')
        .eq('home_owner_user_id', homeOwnerUserId);

      if (!error && ratings) {
        if (ratings.length > 0) {
          const total = ratings.reduce((sum, r) => sum + r.rating, 0);
          setAverageRating(total / ratings.length);
          setTotalRatings(ratings.length);
        } else {
          setAverageRating(0);
          setTotalRatings(0);
        }
      }
    } catch (error) {
          }
  };

  const loadUserRating = async () => {
    if (!habboAccount?.supabase_user_id) return;

    try {
      const { data, error } = await supabase
        .from('user_home_ratings')
        .select('rating')
        .eq('home_owner_user_id', homeOwnerUserId)
        .eq('rating_user_id', habboAccount.supabase_user_id)
        .single();

      if (!error && data) {
        setUserRating(data.rating);
      }
    } catch (error) {
      // No rating found, which is fine
    }
  };

  const handleRating = async (rating: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para avaliar homes.",
        variant: "destructive"
      });
      return;
    }

    if (isOwner) {
      toast({
        title: "Não permitido",
        description: "Você não pode avaliar sua própria home.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('user_home_ratings')
        .upsert({
          home_owner_user_id: homeOwnerUserId,
          rating_user_id: habboAccount?.supabase_user_id,
          rating: rating
        });

      if (!error) {
        setUserRating(rating);
        await loadRatings();
        
        toast({
          title: "Avaliação enviada!",
          description: `Você avaliou a home de ${homeOwnerName} com ${rating} estrela${rating > 1 ? 's' : ''}.`
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua avaliação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, isInteractive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const halfFilled = rating >= star - 0.5 && rating < star;
          
          return (
            <div 
              key={star}
              className={`relative ${isInteractive ? 'cursor-pointer' : ''}`}
              onClick={() => isInteractive && handleRating(star)}
              onMouseEnter={() => isInteractive && setHoverRating(star)}
              onMouseLeave={() => isInteractive && setHoverRating(0)}
            >
              <img
                src="/assets/home/starrating.png"
                alt={`Estrela ${star}`}
                className="w-6 h-6"
                style={{ 
                  imageRendering: 'pixelated',
                  opacity: filled || (isInteractive && (hoverRating >= star)) ? 1 : 0.3,
                  filter: halfFilled ? 'brightness(0.7)' : 'none'
                }}
              />
              {halfFilled && (
                <div 
                  className="absolute top-0 left-0 w-3 h-6 overflow-hidden"
                >
                  <img
                    src="/assets/home/starrating.png"
                    alt={`Meia estrela ${star}`}
                    className="w-6 h-6"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
      <div className="bg-gradient-to-b from-card to-card/90 border border-border rounded-lg shadow-lg overflow-hidden">
        <div className="bg-primary/90 text-primary-foreground p-2 text-center border-b">
          <h3 className="volter-font text-sm font-bold">AVALIAÇÕES</h3>
        </div>
        <div className="p-3 text-center space-y-3">
          {/* Average Rating Display */}
          <div>
            <div className="text-2xl font-bold text-primary volter-font mb-1">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="mb-2">
              {renderStars(averageRating)}
            </div>
            <div className="text-sm text-muted-foreground volter-font">
              {totalRatings} avaliação{totalRatings !== 1 ? 'ões' : ''}
            </div>
          </div>

          {/* User Rating Section */}
          {!isOwner && (
            <div className="border-t pt-3">
              {isLoggedIn ? (
                <div>
                <div className="text-sm text-foreground volter-font mb-2">
                    {userRating > 0 ? 'Sua avaliação:' : 'Avaliar esta home:'}
                  </div>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = userRating >= star || hoverRating >= star;
                      
                      return (
                        <div 
                          key={star}
                          className="relative cursor-pointer"
                          onClick={() => handleRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <img
                            src="/assets/home/starrating.png"
                            alt={`Estrela ${star}`}
                            className="w-7 h-7"
                            style={{ 
                              imageRendering: 'pixelated',
                              opacity: filled ? 1 : 0.3
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {userRating > 0 && (
                    <div className="text-xs text-muted-foreground volter-font mt-1">
                      Você avaliou com {userRating} estrela{userRating > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground volter-font">
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded volter-font"
                  >
                    Fazer login para avaliar
                  </button>
                </div>
              )}
            </div>
          )}

          {isOwner && (
            <div className="text-xs text-muted-foreground volter-font">
              Esta é sua home
            </div>
          )}
        </div>
      </div>
  );
};