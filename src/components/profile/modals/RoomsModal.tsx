import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Home, Star, X } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface RoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: any[];
  userName: string;
  onNavigateToProfile?: (username: string) => void;
}

export const RoomsModal: React.FC<RoomsModalProps> = ({ 
  isOpen, 
  onClose, 
  rooms, 
  userName,
  onNavigateToProfile
}) => {
  const { t } = useI18n();
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<{ [roomId: string]: string }>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para copiar o ID do quarto
  const copyRoomId = async (roomId: string) => {
    try {
      await navigator.clipboard.writeText(`:roomid ${roomId}`);
      setCopiedRoomId(roomId);
      setTimeout(() => setCopiedRoomId(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Função para gerar URLs de thumbnail de quartos com múltiplos fallbacks
  const getRoomThumbnailUrls = (roomId: string) => {
    return [
      // URL real do S3 usado pelo Habbo oficial
      `https://habbo-stories-content.s3.amazonaws.com/navigator-thumbnail/hhbr/${roomId}.png`,
      
      // URLs oficiais do Habbo para thumbnails de quartos
      `https://www.habbo.com.br/habbo-imaging/roomimage/${roomId}`,
      `https://images.habbo.com/c_images/reception/room_icon_${roomId}.png`,
      
      // URLs alternativas do S3
      `https://habbo-stories-content.s3.amazonaws.com/room_thumbs/${roomId}.png`,
      `https://habbo-stories-content.s3.amazonaws.com/servercamera/rooms/${roomId}.png`,
      
      // URLs de fallback genéricas
      `https://images.habbo.com/c_images/reception/room_icon_default.png`,
      '/assets/mockroom.png', // Imagem mock de quarto adicionada pelo usuário
      '/assets/home.png', // Imagem neutra de casa do projeto
      '/placeholder.svg'
    ];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-transparent border-0 p-0 overflow-hidden rounded-lg" style={{
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
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white font-bold text-sm" style={{
                textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
              }}>
                <Home className="w-5 h-5 text-white" />
                {t('pages.console.roomsOf', { username: userName, count: rooms.length })}
              </DialogTitle>
              <DialogClose asChild>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-1 rounded transition-colors"
                  style={{
                    textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                  }}
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
        </div>
        
        {/* Conteúdo principal com fundo de linhas horizontais */}
        <div className="bg-gray-900 relative overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px',
          height: '60vh'
        }}>
          <div className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {Array.isArray(rooms) ? rooms.map((room) => {
                const thumbnailUrls = getRoomThumbnailUrls(room.id);
                const isCopied = copiedRoomId === room.id;
                
                return (
                  <Popover key={room.id}>
                    <PopoverTrigger asChild>
                      <div className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer border border-black">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail do quarto - otimizado */}
                          <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                            <img
                              src={thumbnailUrls[0]}
                              alt={room.name}
                              className="w-full h-full object-cover object-center"
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                setLoadedImages(prev => ({ ...prev, [room.id]: target.src }));
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const currentSrc = target.src;
                                const currentIndex = thumbnailUrls.indexOf(currentSrc);
                                
                                if (currentIndex < thumbnailUrls.length - 1) {
                                  target.src = thumbnailUrls[currentIndex + 1];
                                } else {
                                  target.src = '/assets/mockroom.png';
                                  setLoadedImages(prev => ({ ...prev, [room.id]: '/assets/mockroom.png' }));
                                }
                              }}
                            />
                          </div>
                          
                          {/* Conteúdo otimizado */}
                          <div className="flex-1 min-w-0">
                            {/* Título e ID */}
                            <div className="mb-2">
                              <h3 className="font-semibold text-sm leading-tight text-white truncate">{room.name}</h3>
                              <div className="text-xs text-white/50">ID: {room.id}</div>
                            </div>
                            
                            {/* Descrição compacta */}
                            {room.description && (
                              <p className="text-xs text-white/70 mb-2 line-clamp-1 leading-relaxed">
                                {room.description}
                              </p>
                            )}
                            
                            {/* Stats compactas */}
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-white/70">
                                <img 
                                  src="/assets/roomuserlimit.png" 
                                  alt="Lotação" 
                                  className="w-3 h-3"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                                {room.maximumVisitors || 'N/A'}
                              </span>
                              {room.rating && (
                                <span className="flex items-center gap-1 text-white/70">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  {room.rating}
                                </span>
                              )}
                              {room.creationTime && (
                                <span className="text-white/50">
                                  {formatDate(room.creationTime)}
                                </span>
                              )}
                            </div>
                            
                            {/* Tags compactas */}
                            {room.tags && room.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {room.tags.slice(0, 2).map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/60 px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {room.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs border-white/20 text-white/40 px-1 py-0">
                                    +{room.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </PopoverTrigger>
                    
                    <PopoverContent className="w-80 text-white border border-white/20 p-4" style={{
                      backgroundColor: '#333333'
                    }}>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <img
                            src={loadedImages[room.id] || thumbnailUrls[0]}
                            alt={room.name}
                            className="w-full h-full object-cover object-center rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Se a imagem já carregada falhar, usar a mock
                              target.src = '/assets/mockroom.png';
                              target.style.display = 'block';
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-sm leading-tight text-white flex-1 mr-2">{room.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-white/60">
                              <span>ID: {room.id}</span>
                            </div>
                          </div>
                          
                          {room.description && (
                            <p className="text-xs text-white/70 mb-3 leading-relaxed">
                              {room.description}
                            </p>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-white/80">
                                  <img 
                                    src="/assets/roomuserlimit.png" 
                                    alt="Lotação" 
                                    className="w-4 h-4"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  {room.maximumVisitors || 'N/A'}
                                </span>
                                {room.rating && (
                                  <span className="flex items-center gap-1 text-white/80">
                                    <Star className="w-3 h-3 text-yellow-500" />
                                    {room.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {room.creationTime && (
                              <div className="text-xs text-white/60">
                                Criado: {formatDate(room.creationTime)}
                              </div>
                            )}
                            
                            {room.tags && room.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {room.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/80">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4">
                            <Button
                              onClick={() => copyRoomId(room.id)}
                              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                              style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}
                              size="sm"
                            >
                              {isCopied ? (
                                'Copiado!'
                              ) : (
                                `Copiar :roomid ${room.id}`
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }) : null}
            </div>
            
            {(!Array.isArray(rooms) || rooms.length === 0) && (
              <div className="text-center text-white/60 py-8">
                <Home className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum quarto encontrado</p>
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