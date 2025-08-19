import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FunctionalGuestbookWidget } from '@/components/widgets/FunctionalGuestbookWidget';
import { FunctionalRatingWidget } from './FunctionalRatingWidget';

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
  memberSince?: string; // Data de criação da conta do Habbo
}

interface HomeWidgetProps {
  widget: Widget;
  habboData?: HabboData;
  guestbook: any[];
  isEditMode: boolean;
  isOwner: boolean;
  onPositionChange: (widgetId: string, x: number, y: number) => void;
  onWidgetRemove?: (widgetId: string) => void;
}

export const HomeWidget: React.FC<HomeWidgetProps> = ({
  widget,
  habboData,
  guestbook,
  isEditMode,
  isOwner,
  onPositionChange,
  onWidgetRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: widget.x, elementY: widget.y });
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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

    console.log(`🎯 Iniciando drag do widget ${widget.widget_type}`);
  }, [isEditMode, isOwner, widget.x, widget.y, widget.widget_type]);

  React.useEffect(() => {
    let animationId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Use requestAnimationFrame for smoother updates
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(() => {
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;
          const newX = Math.max(0, Math.min(1080 - (widget.width || 300), dragStart.elementX + deltaX));
          const newY = Math.max(0, Math.min(1800 - (widget.height || 200), dragStart.elementY + deltaY));
          
          onPositionChange(widget.widget_type, newX, newY);
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        cancelAnimationFrame(animationId);
        console.log(`✅ Drag completo do widget ${widget.widget_type}`);
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
      cancelAnimationFrame(animationId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
    };
  }, [isDragging, dragStart, onPositionChange, widget]);

  const getCountryFlag = (hotel: string): string => {
    const flagMap: { [key: string]: string } = {
      'br': '/assets/flagbrazil.png',
      'com': '/assets/flagcom.png',
      'de': '/assets/flagdeus.png',
      'es': '/assets/flagspain.png',
      'fr': '/assets/flagfrance.png',
      'it': '/assets/flagitaly.png',
      'nl': '/assets/flagnetl.png',
      'fi': '/assets/flafinland.png',
      'tr': '/assets/flagtrky.png'
    };
    return flagMap[hotel.toLowerCase()] || '/assets/flagcom.png'; // fallback
  };

  const formatDate = (memberSince?: string) => {
    if (!memberSince) return 'Janeiro 2024';
    
    try {
      // API do Habbo retorna formato "2006-01-01T00:00:00.000+0000" 
      const date = new Date(memberSince);
      
      if (isNaN(date.getTime())) {
        return 'Janeiro 2024';
      }
      
      return date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return 'Janeiro 2024';
    }
  };

  const renderWidgetContent = () => {
    switch (widget.widget_type) {
      case 'avatar':
      case 'usercard':
        return (
          <Card className="w-full h-full bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardContent className="p-4 h-full">
              {/* Horizontal layout with proper proportions */}
              <div className="flex items-center gap-4 h-full">
                {/* Avatar section - fixed size to prevent compression */}
                <div className="flex-shrink-0">
                  <div 
                    className="bg-transparent rounded-lg flex items-center justify-center"
                    style={{ 
                      width: '80px',
                      height: '120px', // Real avatar proportions
                      minWidth: '80px',
                      minHeight: '120px'
                    }}
                  >
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboData.habbo_name}&direction=2&head_direction=3&size=l`}
                      alt={habboData.habbo_name}
                      className="object-contain"
                      style={{ 
                        imageRendering: 'pixelated',
                        width: '80px',
                        height: '120px', // Maintain real proportions
                        maxWidth: 'none',
                        maxHeight: 'none'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboData.habbo_name}&direction=2&head_direction=3&size=l`;
                      }}
                    />
                  </div>
                </div>
                
                {/* User info section - flexible width */}
                <div className="flex-1 min-w-0 h-full flex flex-col justify-between py-2">
                  {/* User name and status */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-800 volter-font habbo-text truncate">
                        {habboData.habbo_name}
                      </h3>
                      <div className="flex items-center gap-1">
                        {habboData.is_online ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full" title="Offline" />
                        )}
                      </div>
                    </div>
                    
                    {/* Motto */}
                    <p className="text-sm text-gray-600 volter-font mb-2 line-clamp-2">
                      {habboData.motto || 'Sem missão definida'}
                    </p>
                  </div>

                  {/* Bottom info */}
                  <div className="space-y-1">
                    {/* Hotel with flag */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 volter-font">
                      <img 
                        src={getCountryFlag(habboData.hotel || 'br')}
                        alt={`${habboData.hotel} flag`}
                        className="w-4 h-3 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/flagcom.png';
                        }}
                      />
                      <span>{(habboData.hotel || 'br').toUpperCase()}</span>
                    </div>
                    
                    {/* Member since - usar dados reais da API */}
                    <div className="text-xs text-gray-500 volter-font">
                      📅 Membro desde {formatDate(habboData?.memberSince)}
                    </div>

                    {/* Status badge */}
                    <div className="flex gap-1 mt-1">
                      <Badge className="text-xs volter-font bg-blue-100 text-blue-800 px-2 py-0">
                        {habboData.is_online ? '🟢 Online' : '🔴 Offline'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'guestbook':
        return (
          <FunctionalGuestbookWidget
            homeOwnerUserId={habboData.id}
            homeOwnerName={habboData.habbo_name}
          />
        );

        case 'rating':
          return (
            <FunctionalRatingWidget homeOwnerId={habboData.id} />
          );

      default:
        return (
          <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardContent className="p-4 text-center">
              <p className="volter-font">Widget: {widget.widget_type}</p>
            </CardContent>
          </Card>
        );
    }
  };

  const containerStyle = {
    left: widget.x,
    top: widget.y,
    width: widget.width,
    height: widget.height,
    zIndex: isDragging ? 9999 : widget.z_index,
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    opacity: isDragging ? 0.8 : 1
  };

  return (
    <div
      ref={widgetRef}
      className={`absolute select-none ${
        isEditMode && isOwner
          ? 'cursor-move border-2 border-dashed border-blue-400 hover:border-blue-600' 
          : 'cursor-default'
      }`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Edit Mode Controls */}
      {isEditMode && isOwner && (
        <>
          <div className="absolute -top-6 left-0 bg-yellow-500 text-black px-2 py-1 text-xs rounded-tl rounded-tr volter-font">
            {widget.widget_type.toUpperCase()}
          </div>
          
          {/* Remove Button - Only for non-essential widgets */}
          {widget.widget_type !== 'avatar' && widget.widget_type !== 'usercard' && onWidgetRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWidgetRemove(widget.id);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors z-10"
              title="Remover Widget"
            >
              ×
            </button>
          )}
        </>
      )}
      
      {/* Content */}
      <div className="h-full overflow-hidden rounded-lg">
        {renderWidgetContent()}
      </div>

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
