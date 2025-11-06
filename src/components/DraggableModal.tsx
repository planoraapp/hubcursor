import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 500 }
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) {
      return; // Não iniciar drag se clicar em um botão
    }
    
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 bg-white border-2 border-black shadow-2xl rounded-lg overflow-hidden ${
        isMinimized ? 'h-auto' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? 'auto' : `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        minWidth: isMinimized ? '300px' : '400px',
        maxWidth: '90vw',
        maxHeight: '90vh'
      }}
    >
      {/* Header - Área de arrastar */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-bold volter-font text-lg">{title}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Restaurar' : 'Minimizar'}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
            onClick={onClose}
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="overflow-auto h-full" style={{ height: `calc(${size.height}px - 48px)` }}>
          {children}
        </div>
      )}
    </div>
  );
};

