
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingWidget } from './widgets/RatingWidget';
import { useIsMobile } from '@/hooks/use-mobile';

interface Widget {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
  config?: any;
}

interface HabboData {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  motto: string;
  figure_string: string;
  is_online: boolean;
  memberSince?: string;
}

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

interface HomeWidgetProps {
  widget: Widget;
  habboData: HabboData;
  guestbook: GuestbookEntry[];
  isEditMode: boolean;
  isOwner: boolean;
  onRemove: (widgetId: string) => void;
  onPositionChange: (widgetId: string, x: number, y: number) => void;
}

// Helper function to get country flag PNG from hotel
const getCountryFlagPng = (hotel: string): string => {
  const hotelFlags: Record<string, string> = {
    'com.br': '/assets/flagbrazil.png', 'br': '/assets/flagbrazil.png',
    'com': '/assets/flagcom.png', 'us': '/assets/flagcom.png',
    'es': '/assets/flagspain.png', 'com.es': '/assets/flagspain.png',
    'de': '/assets/flagdeus.png', 'com.de': '/assets/flagdeus.png',
    'fr': '/assets/flagfrance.png', 'com.fr': '/assets/flagfrance.png',
    'fi': '/assets/flafinland.png', 'com.fi': '/assets/flafinland.png',
    'it': '/assets/flagitaly.png', 'com.it': '/assets/flagitaly.png',
    'nl': '/assets/flagnetl.png', 'com.nl': '/assets/flagnetl.png',
    'com.tr': '/assets/flagtrky.png', 'tr': '/assets/flagtrky.png'
  };
  return hotelFlags[hotel.toLowerCase()] || '/assets/flagcom.png';
};

export const HomeWidget: React.FC<HomeWidgetProps> = ({
  widget,
  habboData,
  guestbook,
  isEditMode,
  isOwner,
  onRemove,
  onPositionChange
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, elementX: widget.x, elementY: widget.y });
  const [newMessage, setNewMessage] = React.useState('');
  const isMobile = useIsMobile();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || !isOwner) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: widget.x,
      elementY: widget.y
    });
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const canvasWidth = isMobile ? 768 : 1080;
        const canvasHeight = isMobile ? 1280 : 1800;
        const newX = Math.max(0, Math.min(canvasWidth - widget.width, dragStart.elementX + deltaX));
        const newY = Math.max(0, Math.min(canvasHeight - widget.height, dragStart.elementY + deltaY));
        
        onPositionChange(widget.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging, dragStart, onPositionChange, widget]);

  const renderWidgetContent = () => {
    switch (widget.widget_type) {
      case 'avatar':
      case 'usercard':
        const hotel = habboData.hotel === 'br' ? 'com.br' : (habboData.hotel || 'com.br');
        const avatarUrl = `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${habboData.habbo_name}&action=std&direction=4&head_direction=3&gesture=sml&size=l`;
        const flagUrl = getCountryFlagPng(habboData.hotel);
        
        return (
          <div className="flex gap-4 p-4 h-full">
            {/* Avatar sem borda - diagonal esquerda */}
            <div className="flex-shrink-0">
              <img
                src={avatarUrl}
                alt={`${habboData.habbo_name} avatar`}
                className="w-28 h-36 object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/frank.png';
                }}
              />
            </div>
            
            {/* Informações organizadas verticalmente */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Topo: Bandeira + Nome */}
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={flagUrl}
                  alt={`Hotel ${habboData.hotel.toUpperCase()}`}
                  className="w-6 h-4 flex-shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/flagcom.png';
                  }}
                />
                <h3 className="text-lg font-bold font-volter text-black truncate">
                  {habboData.habbo_name}
                </h3>
                <Badge 
                  variant={habboData.is_online ? "default" : "secondary"}
                  className="text-xs ml-auto flex-shrink-0"
                >
                  {habboData.is_online ? "Online" : "Offline"}
                </Badge>
              </div>
              
              {/* Meio: Motto */}
              <div className="mb-2">
                <p className="text-sm text-gray-700 font-volter italic">
                  "{habboData.motto || 'Sem missão definida'}"
                </p>
              </div>
              
              {/* Embaixo: Data de criação real ou estimada */}
              <div className="text-xs text-gray-600 font-volter">
                <p>📅 Membro desde: {habboData.memberSince ? 
                  new Date(habboData.memberSince).toLocaleDateString('pt-BR') : 
                  'Janeiro 2010'}</p>
              </div>
            </div>
          </div>
        );

      case 'guestbook':
        return (
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            <h4 className="font-volter font-bold text-black border-b pb-2">
              📝 Livro de Visitas
            </h4>
            
            {guestbook.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p className="font-volter">Seja o primeiro a deixar uma mensagem!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {guestbook.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded p-2 border">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-volter text-sm font-bold text-blue-600">
                        {entry.author_habbo_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Área para nova mensagem - apenas se não for o dono */}
            {!isOwner && (
              <div className="border-t pt-3">
                <Textarea
                  placeholder="Deixe sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-sm resize-none"
                  rows={2}
                />
                <Button 
                  size="sm" 
                  className="mt-2 w-full font-volter"
                  disabled={!newMessage.trim()}
                >
                  Enviar Mensagem
                </Button>
              </div>
            )}
          </div>
        );

      case 'rating':
        return (
          <div className="p-2">
            <RatingWidget
              homeOwnerId={habboData.id}
              className="border-0 bg-transparent"
            />
          </div>
        );

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-gray-500 font-volter">
              Widget: {widget.widget_type}
            </p>
          </div>
        );
    }
  };

  const containerStyle = {
    left: widget.x,
    top: widget.y,
    width: widget.width,
    height: widget.height,
    zIndex: isDragging ? 9999 : widget.z_index,
    opacity: isDragging ? 0.8 : 1,
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    transition: isDragging ? 'none' : 'all 0.2s ease-out'
  };

  return (
    <div
      className={`absolute ${isEditMode && isOwner ? 'cursor-move' : 'cursor-default'}`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black overflow-hidden">
        {isEditMode && isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
            className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
            title="Remover Widget"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="h-full overflow-hidden">
          {renderWidgetContent()}
        </div>
      </Card>

      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
