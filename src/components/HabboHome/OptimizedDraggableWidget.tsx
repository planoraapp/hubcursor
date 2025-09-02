
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';

interface OptimizedDraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  x: number;
  y: number;
  width?: number;
  height?: number;
  zIndex?: number;
  isEditMode: boolean;
  isResizable?: boolean;
  className?: string;
  onPositionChange?: (x: number, y: number) => void;
  onSizeChange?: (width: number, height: number) => void;
  onZIndexChange?: (zIndex: number) => void;
  onRemove?: () => void;
  sizeRestrictions?: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    resizable: boolean;
  };
}

export const OptimizedDraggableWidget: React.FC<OptimizedDraggableWidgetProps> = memo(({
  id,
  children,
  x,
  y,
  width = 200,
  height = 150,
  zIndex = 1,
  isEditMode,
  isResizable = true,
  className = '',
  onPositionChange,
  onSizeChange,
  onZIndexChange,
  onRemove,
  sizeRestrictions
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: x, elementY: y });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width, height });
  const elementRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const canResize = isResizable && sizeRestrictions?.resizable !== false;

  // Throttled position update using RAF
  const throttledPositionUpdate = useCallback((newX: number, newY: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (onPositionChange) {
        onPositionChange(newX, newY);
      }
    });
  }, [onPositionChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: x,
      elementY: y
    });

    if (onZIndexChange) {
      onZIndexChange(Date.now());
    }

    console.log(`🎯 Starting drag for widget ${id}`);
  }, [isEditMode, x, y, onZIndexChange, id]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !canResize) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width,
      height
    });

    console.log(`🔧 Starting resize for widget ${id}`);
  }, [isEditMode, canResize, width, height, id]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    }
  }, [onRemove]);

  // Mouse move and up handlers with RAF optimization
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && onPositionChange) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newX = Math.max(0, Math.min(1200, dragStart.elementX + deltaX));
        const newY = Math.max(0, Math.min(800, dragStart.elementY + deltaY));
        
        throttledPositionUpdate(newX, newY);
      }

      if (isResizing && onSizeChange && sizeRestrictions) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(
          sizeRestrictions.minWidth, 
          Math.min(sizeRestrictions.maxWidth, resizeStart.width + deltaX)
        );
        const newHeight = Math.max(
          sizeRestrictions.minHeight, 
          Math.min(sizeRestrictions.maxHeight, resizeStart.height + deltaY)
        );
        
        onSizeChange(newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        console.log(`✅ Drag completed for widget ${id}`);
      }
      if (isResizing) {
        console.log(`✅ Resize completed for widget ${id}`);
      }
      
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, isResizing, dragStart, resizeStart, throttledPositionUpdate, onSizeChange, id, sizeRestrictions]);

  const containerStyle = {
    left: x,
    top: y,
    width: width,
    height: height,
    zIndex: isDragging ? 9999 : zIndex,
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    backgroundColor: isEditMode ? 'rgba(255, 255, 255, 0.98)' : 'white'
  };

  return (
    <Card
      ref={elementRef}
      className={`absolute select-none ${
        isEditMode 
          ? `border-2 border-dashed border-blue-400 cursor-move shadow-xl hover:shadow-2xl` 
          : 'border shadow-md cursor-default'
      } ${className}`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Content */}
      <div 
        className="w-full h-full overflow-hidden"
        style={{ 
          pointerEvents: isEditMode ? 'none' : 'auto',
          padding: '0px'
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <>
          {/* Z-Index Controls */}
          <div className="absolute -top-12 left-0 flex gap-1">
            <button
              className="w-6 h-6 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onZIndexChange) onZIndexChange(zIndex + 1);
              }}
              title="Trazer para frente"
            >
              ↑
            </button>
            <button
              className="w-6 h-6 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onZIndexChange) onZIndexChange(Math.max(1, zIndex - 1));
              }}
              title="Enviar para trás"
            >
              ↓
            </button>
            {onRemove && (
              <button
                className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                title="Remover"
              >
                ×
              </button>
            )}
          </div>

          {/* Resize handle */}
          {canResize && (
            <div
              className="resize-handle absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize rounded-tl-lg hover:bg-blue-600 transition-colors border-2 border-white shadow-lg"
              onMouseDown={handleResizeMouseDown}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                pointerEvents: 'auto'
              }}
            >
              <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white"></div>
            </div>
          )}

          {/* Visual indicators */}
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          

          {!canResize && (
            <div className="absolute -top-8 right-0 bg-orange-500 text-white px-2 py-1 rounded text-xs volter-font shadow-lg">
              FIXO
            </div>
          )}

          {isDragging && (
            <div className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none">
              <div className="absolute inset-2 border-2 border-dashed border-blue-400 rounded"></div>
            </div>
          )}
        </>
      )}
    </Card>
  );
});

OptimizedDraggableWidget.displayName = 'OptimizedDraggableWidget';
