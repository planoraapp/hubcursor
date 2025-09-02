
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnimatedConsoleProps {
  isActive: boolean;
  className?: string;
}

export const AnimatedConsole = ({
  isActive,
  className = ''
}: AnimatedConsoleProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();

  const frames = [
    '/assets/consoleoff.gif',
    '/assets/consoleon1.gif', 
    '/assets/consoleon2.gif',
    '/assets/consoleon3.gif'
  ];

  useEffect(() => {
    // Só animar se estiver ativo E na página do console
    const isOnConsolePage = location.pathname === '/console';
    
    if (isActive && isOnConsolePage && !isAnimating) {
      setIsAnimating(true);
      let frameIndex = 0;
      
      const animateConsole = () => {
        if (frameIndex < frames.length - 1) {
          frameIndex++;
          setCurrentFrame(frameIndex);
          setTimeout(animateConsole, 500);
        } else {
          setIsAnimating(false);
        }
      };
      
      setTimeout(animateConsole, 300);
    } else if (!isActive || !isOnConsolePage) {
      setCurrentFrame(0);
      setIsAnimating(false);
    }
  }, [isActive, isAnimating, location.pathname]);

  return (
    <div className={`${className}`}>
      <img 
        src={frames[currentFrame]}
        alt="Console"
        className="w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
