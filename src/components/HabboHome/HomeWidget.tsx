
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingWidget } from './widgets/RatingWidget';
import { GuestbookWidget } from './widgets/GuestbookWidget';
import { ACMAnotepadWidget } from '@/components/widgets/ACMAnotepadWidget';
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

    console.log('📊 Iniciando drag do widget:', { widgetId: widget.id, widgetType: widget.widget_type });

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
        const canvasWidth = 1000;
        const canvasHeight = 1400;
        
        // Calcular nova posição
        let newX = dragStart.elementX + deltaX;
        let newY = dragStart.elementY + deltaY;
        
        // Aplicar limites do canvas
        newX = Math.max(0, Math.min(canvasWidth - widget.width, newX));
        newY = Math.max(0, Math.min(canvasHeight - widget.height, newY));
        
        // Arredondar para pixels inteiros para melhor precisão
        newX = Math.round(newX);
        newY = Math.round(newY);
        
        // Threshold mínimo para evitar movimentos muito pequenos
        const threshold = 2;
        const deltaXAbs = Math.abs(deltaX);
        const deltaYAbs = Math.abs(deltaY);
        
        // Só atualizar se o movimento for significativo
        if (deltaXAbs >= threshold || deltaYAbs >= threshold) {
          console.log('📊 Movendo widget:', { widgetId: widget.id, newX, newY, deltaX, deltaY });
          onPositionChange(widget.id, newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        console.log('✅ Drag completo do widget:', { widgetId: widget.id, widgetType: widget.widget_type });
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
    };
  }, [isDragging, dragStart, onPositionChange, widget]);

  const renderWidgetContent = () => {
    switch (widget.widget_type) {
      case 'avatar':
      case 'usercard':
        const hotel = habboData.hotel === 'br' ? 'com.br' : (habboData.hotel || 'com.br');
        const avatarUrl = `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${habboData.habbo_name}&action=std&direction=4&head_direction=4&gesture=sml&size=l`;
        const flagUrl = getCountryFlagPng(habboData.hotel);
        
        // Formatar data do memberSince
        const formatMemberSince = (memberSince: string) => {
          if (!memberSince) return 'Criado em: 2021';
          try {
            const date = new Date(memberSince);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `Criado em: ${day}/${month}/${year}`;
          } catch {
            return 'Criado em: 2021';
          }
        };
        
        return (
          <div className="flex gap-3 p-4 h-full">
            {/* Avatar - proporção 64x110 */}
            <div className="flex-shrink-0">
              <img
                src={avatarUrl}
                alt={`${habboData.habbo_name} avatar`}
                className="w-16 h-28 object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://www.habbo.com/habbo-imaging/avatarimage?user=${habboData.habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=l`;
                }}
              />
            </div>
            
            {/* Informações do usuário - layout vertical organizado */}
            <div className="flex-1 flex flex-col justify-start pt-1 min-w-0">
              {/* Linha 1: Bandeira + Nome + Status online/offline */}
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={flagUrl}
                  alt={`${habboData.hotel} flag`}
                  className="w-4 h-3 flex-shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/flagcom.png';
                  }}
                />
                <h3 className="text-sm font-bold text-gray-800 truncate flex-1 font-volter">
                  {habboData.habbo_name}
                </h3>
                <div className="flex-shrink-0" title={habboData.is_online ? 'Online' : 'Offline'}>
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    habboData.is_online ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
              </div>
              
              {/* Linha 2: Motto em itálico */}
              {habboData.motto && (
                <p className="text-xs text-gray-600 italic mb-2 line-clamp-2 font-volter">
                  "{habboData.motto}"
                </p>
              )}
              
              {/* Linha 3: Data de criação formatada */}
              <p className="text-xs text-gray-500 font-volter">
                {formatMemberSince(habboData.memberSince || '')}
              </p>
            </div>
          </div>
        );

      case 'guestbook':
        return (
          <ACMAnotepadWidget
            entries={guestbook}
            isOwner={isOwner}
            className="w-full h-full"
          />
        );

      case 'rating':
        return (
          <RatingWidget
            homeOwnerId={habboData.id}
            className="w-full h-full"
          />
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
    width: '100%',
    height: '100%',
    zIndex: isDragging ? 9999 : widget.z_index,
    opacity: isDragging ? 0.8 : 1,
    transform: 'scale(1)',
    transition: isDragging ? 'none' : 'all 0.2s ease-out'
  };

  return (
    <div
      className={`relative w-full h-full ${isEditMode && isOwner ? 'cursor-move' : 'cursor-default'}`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black overflow-hidden">
        {isEditMode && isOwner && widget.widget_type !== 'avatar' && widget.widget_type !== 'usercard' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
            className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 shadow-md"
            title="Remover Widget"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {renderWidgetContent()}
      </Card>

      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
