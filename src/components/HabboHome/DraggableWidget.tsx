
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface DraggableWidgetProps {
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
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
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
  onZIndexChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: x, elementY: y });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width, height });
  const elementRef = useRef<HTMLDivElement>(null);

  // Prevenir seleção de texto durante drag
  useEffect(() => {
    if (isDragging || isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } else {
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
    }

    return () => {
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
    };
  }, [isDragging, isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    // Evitar drag se clicou no resize handle
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

    // Trazer widget para frente
    if (onZIndexChange) {
      onZIndexChange(Date.now());
    }

    console.log(`🎯 Iniciando drag do widget ${id}`);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || !isResizable) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width,
      height
    });

    console.log(`🔧 Iniciando resize do widget ${id}`);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && onPositionChange) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newX = Math.max(0, dragStart.elementX + deltaX);
        const newY = Math.max(0, dragStart.elementY + deltaY);
        onPositionChange(newX, newY);
      }

      if (isResizing && onSizeChange) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(200, resizeStart.width + deltaX);
        const newHeight = Math.max(150, resizeStart.height + deltaY);
        onSizeChange(newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        console.log(`✅ Drag finalizado para widget ${id}`);
      }
      if (isResizing) {
        console.log(`✅ Resize finalizado para widget ${id}`);
      }
      
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, onPositionChange, onSizeChange, id]);

  return (
    <Card
      ref={elementRef}
      className={`absolute transition-all duration-200 ${
        isEditMode 
          ? `border-2 border-dashed border-blue-400 cursor-move shadow-xl ${isDragging ? 'shadow-2xl scale-105' : ''}` 
          : 'border shadow-md cursor-default'
      } ${className}`}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: isDragging ? 9999 : zIndex,
        backgroundColor: isEditMode ? 'rgba(255, 255, 255, 0.95)' : 'white'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Conteúdo do widget */}
      <div 
        className="w-full h-full overflow-hidden"
        style={{ 
          pointerEvents: isEditMode ? 'none' : 'auto',
          padding: '0px' // Remover padding extra
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>

      {/* Resize handle */}
      {isEditMode && isResizable && (
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

      {/* Indicador visual de modo de edição */}
      {isEditMode && (
        <>
          {/* Ponto indicador no canto superior esquerdo */}
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          
          {/* Label do widget */}
          <div className="absolute -top-8 left-0 bg-blue-600 text-white px-2 py-1 rounded text-xs volter-font shadow-lg">
            {id.toUpperCase()}
          </div>

          {/* Overlay semi-transparente quando dragging */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none">
              <div className="absolute inset-2 border-2 border-dashed border-blue-400 rounded"></div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
