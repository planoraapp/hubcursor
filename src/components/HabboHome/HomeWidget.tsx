
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

interface HomeWidgetProps {
  widget: Widget;
  habboData: HabboData;
  guestbook: any[];
  isEditMode: boolean;
  isOwner: boolean;
  onPositionChange: (widgetId: string, x: number, y: number) => void;
}

export const HomeWidget: React.FC<HomeWidgetProps> = ({
  widget,
  habboData,
  guestbook,
  isEditMode,
  isOwner,
  onPositionChange
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
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newX = Math.max(0, Math.min(1200 - widget.width, dragStart.elementX + deltaX));
        const newY = Math.max(0, Math.min(800 - widget.height, dragStart.elementY + deltaY));
        
        onPositionChange(widget.widget_type, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        console.log(`✅ Drag completo do widget ${widget.widget_type}`);
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
        return (
          <Card 
            className="w-full h-full bg-white backdrop-blur-sm shadow-lg border-2 border-black"
            style={{ background: 'rgba(255, 255, 255, 0.9)' }}
          >
            <CardContent className="p-4 h-full">
              <div className="flex items-center gap-4 h-full">
                {/* Avatar com fundo transparente */}
                <div 
                  className="flex-shrink-0 rounded-lg p-2"
                  style={{ 
                    background: 'transparent',
                    minWidth: '80px',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboData.habbo_name}&direction=2&head_direction=3&size=l`}
                    alt={habboData.habbo_name}
                    className="max-w-full max-h-full object-contain"
                    style={{ 
                      imageRendering: 'pixelated',
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '80px',
                      maxHeight: '120px'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboData.habbo_name}&direction=2&head_direction=3&size=l`;
                    }}
                  />
                </div>
                
                {/* Informações do usuário */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 volter-font habbo-text mb-1 truncate">
                    {habboData.habbo_name}
                  </h3>
                  <p className="text-sm text-gray-600 volter-font mb-2 line-clamp-2">
                    {habboData.motto || 'Sem missão definida'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge className="text-xs volter-font bg-blue-100 text-blue-800">
                      Hotel: {habboData.hotel?.toUpperCase() || 'BR'}
                    </Badge>
                    {habboData.is_online && (
                      <Badge className="text-xs volter-font bg-green-100 text-green-800">
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'guestbook':
        return (
          <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3">
              <CardTitle className="volter-font text-center text-lg habbo-text">
                📝 Livro de Visitas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {guestbook.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="bg-gray-50 p-2 rounded-lg border">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-blue-600 volter-font">
                        {entry.author_habbo_name}
                      </span>
                      <span className="text-xs text-gray-500 volter-font">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 volter-font">{entry.message}</p>
                  </div>
                ))}
                {guestbook.length === 0 && (
                  <p className="text-sm text-gray-500 volter-font text-center py-4">
                    Nenhuma mensagem ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'rating':
        return (
          <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3">
              <CardTitle className="volter-font text-center text-lg habbo-text">
                ⭐ Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-center">
              <div className="text-3xl mb-2 volter-font text-yellow-600">4.8</div>
              <div className="text-sm text-gray-600 volter-font">Baseado em 25 avaliações</div>
            </CardContent>
          </Card>
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
      {renderWidgetContent()}
      
      {/* Controles de edição */}
      {isEditMode && isOwner && (
        <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs volter-font">
          {widget.widget_type.toUpperCase()}
        </div>
      )}
      
      {/* Indicador de drag */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
