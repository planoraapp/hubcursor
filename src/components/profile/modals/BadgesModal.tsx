
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { habboProxyService } from '@/services/habboProxyService';

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Emblemas de {userName} ({badges.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-4">
            {badges.map((badge, index) => (
              <div 
                key={`${badge.code}-${index}`}
                className="text-center group cursor-help bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-colors"
                title={`${badge.name}${badge.description ? `: ${badge.description}` : ''}`}
              >
                <div className="relative">
                  <img
                    src={habboProxyService.getBadgeUrl(badge.code)}
                    alt={badge.name}
                    className="w-12 h-12 mx-auto border border-gray-200 rounded bg-white p-1 group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 truncate leading-tight">
                  {badge.name}
                </p>
                {badge.description && (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 leading-tight">
                    {badge.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {badges.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum emblema encontrado</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
