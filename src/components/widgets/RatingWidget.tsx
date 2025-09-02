
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';

export const RatingWidget = () => {
  const [rating, setRating] = useState({ likes: 42, dislikes: 3 });
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  const handleVote = (type: 'like' | 'dislike') => {
    if (userVote === type) {
      // Remove vote
      setRating(prev => ({
        ...prev,
        [type === 'like' ? 'likes' : 'dislikes']: prev[type === 'like' ? 'likes' : 'dislikes'] - 1
      }));
      setUserVote(null);
    } else {
      // Add new vote, remove old if exists
      setRating(prev => ({
        likes: userVote === 'like' ? prev.likes - 1 : (type === 'like' ? prev.likes + 1 : prev.likes),
        dislikes: userVote === 'dislike' ? prev.dislikes - 1 : (type === 'dislike' ? prev.dislikes + 1 : prev.dislikes)
      }));
      setUserVote(type);
    }
  };

  return (
    <Card className="w-full h-full p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-yellow-600" />
        <h3 className="font-bold text-lg volter-font">Avaliação</h3>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-yellow-600 volter-font">
          {Math.round((rating.likes / (rating.likes + rating.dislikes)) * 100) || 0}%
        </div>
        <div className="text-sm text-gray-600 volter-font">
          {rating.likes + rating.dislikes} avaliações
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={userVote === 'like' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('like')}
          className="flex-1 volter-font"
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          {rating.likes}
        </Button>
        <Button
          variant={userVote === 'dislike' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => handleVote('dislike')}
          className="flex-1 volter-font"
        >
          <ThumbsDown className="w-4 h-4 mr-1" />
          {rating.dislikes}
        </Button>
      </div>
    </Card>
  );
};
