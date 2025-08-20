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
      className={`absolute w-16 h-16 rounded-full border-2 border-dashed border-blue-400 bg-blue-400/20 ${className}`}
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Rotation handle */}
      <div
        className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md"
        style={{
          right: '-6px',
          top: '50%',
          transform: `translateY(-50%) rotate(${rotation}deg)`,
          transformOrigin: `-26px center`
        }}
      />
      
      {/* Center dot */}
      <div className="absolute w-2 h-2 bg-blue-600 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      
      {/* Rotation value display */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-volter text-white bg-black/80 px-2 py-1 rounded">
        {rotation}°
      </div>
    </div>
  );
};