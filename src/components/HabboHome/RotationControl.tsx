import React, { useCallback, useRef, useState } from 'react';

interface RotationControlProps {
  rotation: number;
  onRotationChange: (rotation: number) => void;
  className?: string;
}

export const RotationControl: React.FC<RotationControlProps> = ({
  rotation,
  onRotationChange,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);

  const calculateAngle = useCallback((e: MouseEvent, rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Normalize angle to 0-360
    if (angle < 0) angle += 360;
    
    return Math.round(angle);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !controlRef.current) return;
      
      const rect = controlRef.current.getBoundingClientRect();
      const angle = calculateAngle(e, rect);
      onRotationChange(angle);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [isDragging, calculateAngle, onRotationChange]);

  return (
    <div
      ref={controlRef}
      className={`absolute ${className}`}
      style={{
        left: '50%',
        top: '100%',
        transform: 'translateX(-50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
        marginTop: '8px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Rotation handle - Botão preso à parte inferior */}
      <div
        className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center'
        }}
        title={`Rotação: ${rotation}°`}
      >
        {/* Ícone de rotação */}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="white"
          className="transform rotate-45"
        >
          <path d="M12 2L13.09 8.26L19 7L14.74 12.26L20 13L13.74 19.26L12 20L10.91 13.74L5 15L9.26 9.74L4 9L10.26 2.74L12 2Z"/>
        </svg>
      </div>
      
      {/* Rotation value display */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-volter text-white bg-black/80 px-2 py-1 rounded whitespace-nowrap">
        {rotation}°
      </div>
    </div>
  );
};