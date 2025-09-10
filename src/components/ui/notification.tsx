import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Aguarda a animação de saída
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`
          bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg sidebar-font-option-4
          transition-all duration-300 ease-out
          ${isAnimating 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-8 opacity-0'
          }
        `}
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          letterSpacing: '0.2px',
          textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✓</span>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Notification;
