import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles } from 'lucide-react';

interface WelcomeCommentBadgeProps {
  isVisible: boolean;
}

export const WelcomeCommentBadge: React.FC<WelcomeCommentBadgeProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <Badge 
        variant="secondary" 
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 shadow-lg border-2 border-white"
      >
        <Crown className="w-3 h-3 mr-1" />
        <Sparkles className="w-3 h-3" />
      </Badge>
    </div>
  );
};
