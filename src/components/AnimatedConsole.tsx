
import { useState, useEffect } from 'react';

interface AnimatedConsoleProps {
  isActive: boolean;
  className?: string;
}

export const AnimatedConsole = ({ isActive, className = '' }: AnimatedConsoleProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const frames = [
    '/assets/consoleoff.png',
    '/assets/consoleon1.png', 
    '/assets/consoleon2.png',
    '/assets/consoleon3.png'
  ];

  useEffect(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true);
      let frameIndex = 0;
      
      const animateConsole = () => {
        if (frameIndex < frames.length - 1) {
          frameIndex++;
          setCurrentFrame(frameIndex);
          setTimeout(animateConsole, 500); // 0.5s entre frames
        } else {
          setIsAnimating(false);
        }
      };
      
      setTimeout(animateConsole, 300); // Delay inicial
    } else if (!isActive) {
      setCurrentFrame(0);
      setIsAnimating(false);
    }
  }, [isActive]);

  return (
    <div className={`${className}`}>
      <img 
        src={frames[currentFrame]}
        alt="Console Habbo"
        className="w-12 h-12 transition-opacity duration-300"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
