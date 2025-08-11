
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useEnhancedHabboHome } from '@/hooks/useEnhancedHabboHome';
import { UserCard } from '@/components/homes/UserCard';
import { GuestbookWidget } from '@/components/homes/GuestbookWidget';
import { RatingWidget } from '@/components/homes/RatingWidget';
import { EditModeToggle } from '@/components/homes/EditModeToggle';
import { StickerSystem } from '@/components/homes/StickerSystem';
import { BackgroundCustomizer } from '@/components/homes/BackgroundCustomizer';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const EnhancedHabboHome: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });
  const { toast } = useToast();

  const {
    widgets,
    stickers,
    background,
    guestbook,
    habboData,
    loading,
    isEditMode,
    isOwner,
    setIsEditMode,
    updateWidgetPosition,
    updateWidgetSize,
    addGuestbookEntry,
    getWidgetSizeRestrictions
  } = useEnhancedHabboHome(username || '');

  // Canvas resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width: Math.max(800, width), height: Math.max(500, height) });
      }
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando Habbo Home...</p>
        </div>
      </div>
    );
  }

  if (!habboData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Usuário não encontrado
          </h1>
          <p className="text-gray-600">
            O usuário "{username}" não foi encontrado.
          </p>
        </div>
      </div>
    );
  }

  const getBackgroundStyle = () => {
    switch (background.background_type) {
      case 'color':
        return { backgroundColor: background.background_value };
      case 'repeat':
        return { 
          backgroundImage: `url(${background.background_value})`,
          backgroundRepeat: 'repeat'
        };
      case 'cover':
        return { 
          backgroundImage: `url(${background.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: '#c7d2dc' };
    }
  };

  const renderWidget = (widget: any) => {
    const restrictions = getWidgetSizeRestrictions(widget.widget_id);
    
    const commonProps = {
      style: {
        position: 'absolute' as const,
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: widget.z_index,
        cursor: isEditMode ? 'move' : 'default'
      },
      className: `${isEditMode ? 'border-2 border-dashed border-blue-400' : ''}`
    };

    switch (widget.widget_id) {
      case 'usercard':
      case 'avatar':
        return (
          <div key={widget.id} {...commonProps}>
            <UserCard 
              habboData={habboData}
              isEditMode={isEditMode}
            />
          </div>
        );

      case 'guestbook':
        return (
          <div key={widget.id} {...commonProps}>
            <GuestbookWidget
              entries={guestbook}
              onAddEntry={addGuestbookEntry}
              isOwner={isOwner}
              homeOwnerName={habboData.name}
            />
          </div>
        );

      case 'rating':
        return (
          <div key={widget.id} {...commonProps}>
            <RatingWidget
              homeOwnerUserId={habboData.id}
              homeOwnerName={habboData.name}
            />
          </div>
        );

      default:
        return (
          <div key={widget.id} {...commonProps}>
            <div className="w-full h-full bg-white/90 border border-gray-300 rounded p-2 flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                Widget: {widget.widget_id}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen" style={getBackgroundStyle()}>
      {/* Header with user info and edit controls */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🏠 {habboData.name}'s Home
            </h1>
            <p className="text-gray-600 text-sm">
              {isOwner ? 'Sua Habbo Home pessoal' : `Visitando a home de ${habboData.name}`}
            </p>
          </div>
          
          {isOwner && (
            <div className="flex items-center gap-4">
              <BackgroundCustomizer />
              <EditModeToggle 
                isEditMode={isEditMode}
                onToggle={setIsEditMode}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main canvas area */}
      <div 
        ref={canvasRef}
        className="relative mx-auto mt-8 border-2 border-gray-300 bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden"
        style={{ 
          width: '90%', 
          maxWidth: '1200px', 
          minHeight: '600px',
          height: 'auto'
        }}
      >
        {/* Widgets */}
        {widgets.map(renderWidget)}

        {/* Stickers */}
        <StickerSystem 
          stickers={stickers}
          isEditMode={isEditMode}
          canvasSize={canvasSize}
        />

        {/* Edit mode overlay */}
        {isEditMode && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
            🎨 Modo de Edição Ativo
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center py-8">
        <p className="text-gray-600 text-sm">
          {isOwner 
            ? 'Arraste e redimensione os widgets no modo de edição para personalizar sua home!'
            : `Gostou desta home? Deixe um comentário no guestbook!`
          }
        </p>
      </div>
    </div>
  );
};

export default EnhancedHabboHome;
