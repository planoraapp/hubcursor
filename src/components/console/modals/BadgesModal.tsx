
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: any[];
  userName: string;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ 
  isOpen, 
  onClose, 
  badges, 
  userName 
}) => {
  const getBadgeUrl = (badgeCode: string) => {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl text-white">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Emblemas de {userName} ({badges.length})
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 p-4">
            {badges.map((badge, index) => (
              <div 
                key={`${badge.code}-${index}`}
                className="text-center group cursor-help bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-3 transition-colors border border-gray-700"
                title={`${badge.name}${badge.description ? `: ${badge.description}` : ''}`}
              >
                <div className="relative mb-2">
                  <img
                    src={getBadgeUrl(badge.code)}
                    alt={badge.name}
                    className="w-12 h-12 mx-auto border border-gray-600 rounded bg-white p-1 group-hover:scale-110 transition-transform"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-300 truncate leading-tight">
                  {badge.name}
                </p>
                {badge.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-tight">
                    {badge.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {badges.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum emblema encontrado</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
