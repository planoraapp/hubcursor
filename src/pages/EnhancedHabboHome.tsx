import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnhancedHabboHome } from '@/hooks/useEnhancedHabboHome';
import { UserCard } from '@/components/homes/UserCard';
import { GuestbookWidget } from '@/components/homes/GuestbookWidget';
import { RatingWidget } from '@/components/homes/RatingWidget';
import { EditModeToggle } from '@/components/homes/EditModeToggle';
import { InteractiveStickerSystem } from '@/components/homes/InteractiveStickerSystem';
import { BackgroundCustomizer } from '@/components/homes/BackgroundCustomizer';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  zIndex: number;
  createdAt: string;
}

const EnhancedHabboHome: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
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
    getWidgetSizeRestrictions,
    handleStickerDrop,
    handleStickerPositionChange,
    handleBackgroundChange
  } = useEnhancedHabboHome(username || '');

  // Convert stickers to the expected format for InteractiveStickerSystem
  const placedStickers: PlacedSticker[] = stickers.map(sticker => ({
    id: sticker.id,
    stickerId: sticker.sticker_id,
    x: sticker.x,
    y: sticker.y,
    zIndex: sticker.z_index || 1,
    createdAt: new Date().toISOString() // Use current date as fallback since created_at doesn't exist
  }));

  // Canonical redirect based on hotel detection
  useEffect(() => {
    if (habboData && !window.location.pathname.includes(`/${habboData.hotel}/`)) {
      const canonicalPath = `/enhanced-home/${habboData.hotel}/${habboData.habbo_name}`;
      console.log('🔄 Redirecting to canonical URL:', canonicalPath);
      navigate(canonicalPath, { replace: true });
    }
  }, [habboData, navigate]);

  // Canvas resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ 
          width: Math.max(800, Math.min(1200, width)), 
          height: Math.max(500, Math.min(800, height))
        });
      }
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white text-lg volter-font"
             style={{
               textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black'
             }}>
            Carregando Habbo Home Enhanced...
          </p>
        </div>
      </div>
    );
  }

  if (!habboData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg max-w-md">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4 volter-font">
            Habbo Home não encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            O usuário "{username}" não foi encontrado ou não possui uma Habbo Home.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded volter-font hover:bg-blue-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const getBackgroundStyle = () => {
    const baseStyle = {
      minHeight: '100vh',
      backgroundImage: 'url(/assets/bghabbohub.png)',
      backgroundRepeat: 'repeat'
    };

    if (background.background_type === 'color') {
      return {
        ...baseStyle,
        background: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), ${background.background_value}`
      };
    } else if (background.background_type === 'repeat') {
      return {
        ...baseStyle,
        background: `url(${background.background_value})`,
        backgroundRepeat: 'repeat'
      };
    } else if (background.background_type === 'cover') {
      return {
        ...baseStyle,
        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${background.background_value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      };
    }

    return baseStyle;
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
      className: `${isEditMode ? 'border-2 border-dashed border-blue-400 bg-white/5' : ''} transition-all duration-200`
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
              homeOwnerName={habboData.habbo_name}
            />
          </div>
        );

      case 'rating':
        return (
          <div key={widget.id} {...commonProps}>
            <RatingWidget
              homeOwnerUserId={habboData.id}
              homeOwnerName={habboData.habbo_name}
            />
          </div>
        );

      default:
        return (
          <div key={widget.id} {...commonProps}>
            <div className="w-full h-full bg-white/90 border border-gray-300 rounded-lg p-4 flex items-center justify-center shadow-sm">
              <span className="text-gray-500 text-sm volter-font">
                Widget: {widget.widget_id}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={getBackgroundStyle()}>
      {/* Header */}
      <div className="p-6">
        <PageHeader 
          title={`🏠 ${habboData.habbo_name}'s Enhanced Home`}
          subtitle={isOwner ? 'Sua Habbo Home pessoal' : `Visitando a home de ${habboData.habbo_name}`}
          icon="/assets/casahabbo.png"
        >
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-500 text-white volter-font">
              Hotel {habboData.hotel.toUpperCase()}
            </Badge>
            {isOwner && (
              <>
                <BackgroundCustomizer onBackgroundChange={handleBackgroundChange} />
                <EditModeToggle 
                  isEditMode={isEditMode}
                  onToggle={setIsEditMode}
                />
              </>
            )}
          </div>
        </PageHeader>
      </div>

      {/* Main canvas area */}
      <div className="px-6 pb-6">
        <div 
          ref={canvasRef}
          className="relative mx-auto bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl"
          style={{ 
            width: '95%', 
            maxWidth: '1200px', 
            minHeight: '600px',
            height: 'auto'
          }}
        >
          {/* Widgets */}
          {widgets.map(renderWidget)}

          {/* Interactive Sticker System */}
          <InteractiveStickerSystem 
            stickers={placedStickers}
            isEditMode={isEditMode}
            isOwner={isOwner}
            canvasSize={canvasSize}
            onStickerAdd={handleStickerDrop}
            onStickerMove={handleStickerPositionChange}
            onStickerRemove={(stickerId) => {
              // Implementation for removing stickers
              console.log('Remove sticker:', stickerId);
            }}
          />

          {/* Edit mode overlay */}
          {isEditMode && (
            <div className="absolute top-4 left-4 bg-blue-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium volter-font backdrop-blur-sm">
              🎨 Modo de Edição Ativo
            </div>
          )}

          {/* Empty state */}
          {widgets.length === 0 && !isEditMode && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl volter-font mb-2 text-gray-700">Home Vazia</h3>
                <p className="text-gray-600">Esta home ainda não foi personalizada.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center py-6">
        <p className="text-white/80 text-sm volter-font"
           style={{
             textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
           }}>
          {isOwner 
            ? 'Arraste widgets e stickers no modo de edição para personalizar sua home!'
            : `Gostou desta home? Deixe um comentário no guestbook!`
          }
        </p>
      </div>
    </div>
  );
};

export default EnhancedHabboHome;
