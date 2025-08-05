
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: x,
      elementY: y
    });

    // Trazer para frente ao clicar
    if (onZIndexChange) {
      onZIndexChange(Date.now());
    }
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
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && onPositionChange) {
        const newX = Math.max(0, dragStart.elementX + (e.clientX - dragStart.x));
        const newY = Math.max(0, dragStart.elementY + (e.clientY - dragStart.y));
        onPositionChange(newX, newY);
      }

      if (isResizing && onSizeChange) {
        const newWidth = Math.max(150, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(100, resizeStart.height + (e.clientY - resizeStart.y));
        onSizeChange(newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
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
  }, [isDragging, isResizing, dragStart, resizeStart, onPositionChange, onSizeChange]);

  return (
    <Card
      ref={elementRef}
      className={`absolute select-none transition-all duration-200 ${
        isEditMode ? 'border-2 border-dashed border-blue-400 cursor-move' : 'border'
      } ${className}`}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: zIndex
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-full h-full p-4 overflow-hidden">
        {children}
      </div>

      {/* Resize handle */}
      {isEditMode && isResizable && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </Card>
  );
};
