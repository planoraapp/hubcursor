import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trophy, X } from 'lucide-react';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: any[];
  userName: string;
  onNavigateToProfile?: (username: string) => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ 
  isOpen, 
  onClose, 
  badges, 
  userName,
  onNavigateToProfile
}) => {
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // Função para gerar URLs de emblemas com múltiplos fallbacks
  const getBadgeUrls = (badgeCode: string) => {
    return [
      // URLs oficiais do Habbo para emblemas
      `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
      `https://images.habbo.com/c_images/album1584/${badgeCode}.png`,
      
      // URLs alternativas
      `https://www.habbo.com.br/habbo-imaging/badge/${badgeCode}`,
      `https://habbo-stories-content.s3.amazonaws.com/badges/${badgeCode}.gif`,
      
      // URLs de fallback genéricas
      `https://images.habbo.com/c_images/album1584/default.gif`,
      '/placeholder.svg'
    ];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-transparent border-0 p-0 overflow-hidden rounded-lg" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
        backgroundSize: '100% 2px'
      }}>
        {/* Borda superior amarela com textura pontilhada */}
        <div className="bg-yellow-400 border-2 border-black border-b-0 rounded-t-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
          <DialogHeader className="p-4 relative z-10">
            <DialogTitle className="flex items-center gap-2 text-black font-bold volter-font" style={{
              textShadow: '1px 1px 0px rgba(0,0,0,0.3)'
            }}>
              <Trophy className="w-5 h-5 text-black" />
              Emblemas de {userName} ({badges.length})
            </DialogTitle>
          </DialogHeader>
        </div>
        
        {/* Conteúdo principal com fundo de linhas horizontais */}
        <div className="bg-gray-900 relative overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px',
          height: '60vh'
        }}>
          <div className="relative z-10">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-4">
              {badges.map((badge, index) => {
                const badgeUrls = getBadgeUrls(badge.code);
                return (
                  <Popover key={`${badge.code}-${index}`} open={selectedBadge?.code === badge.code} onOpenChange={(open) => {
                    if (open) {
                      setSelectedBadge(badge);
                    } else {
                      setSelectedBadge(null);
                    }
                  }}>
                    <PopoverTrigger asChild>
                      <div className="text-center group cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-colors">
                        <div className="relative">
                          <img
                            src={badgeUrls[0]}
                            alt={badge.name}
                            className="w-12 h-12 mx-auto group-hover:scale-110 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const currentSrc = target.src;
                              const currentIndex = badgeUrls.indexOf(currentSrc);
                              
                              if (currentIndex < badgeUrls.length - 1) {
                                target.src = badgeUrls[currentIndex + 1];
                              } else {
                                target.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-white/60 mt-2 truncate leading-tight">
                          {badge.name}
                        </p>
                        {badge.description && (
                          <p className="text-xs text-white/40 mt-1 line-clamp-2 leading-tight">
                            {badge.description}
                          </p>
                        )}
                      </div>
                    </PopoverTrigger>
                    
                    <PopoverContent className="w-80 text-white border border-white/20 p-4" style={{
                      backgroundColor: '#333333'
                    }}>
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <img
                            src={badgeUrls[0]}
                            alt={badge.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const currentSrc = target.src;
                              const currentIndex = badgeUrls.indexOf(currentSrc);
                              
                              if (currentIndex < badgeUrls.length - 1) {
                                target.src = badgeUrls[currentIndex + 1];
                              } else {
                                target.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg text-white">{badge.name}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 text-white/60 hover:text-white flex-shrink-0"
                              onClick={() => setSelectedBadge(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-white/70 leading-relaxed">
                              {badge.description || "- sem descrição"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
            
            {badges.length === 0 && (
              <div className="text-center text-white/60 py-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum emblema encontrado</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Borda inferior amarela com textura pontilhada */}
        <div className="bg-yellow-400 border-2 border-black border-t-0 rounded-b-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
          <div className="p-2 relative z-10"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
