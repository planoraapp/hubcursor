
import { useState, useEffect } from 'react';

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

  const frames = [
    '/assets/consoleoff.gif',
    '/assets/consoleon1.gif', 
    '/assets/consoleon2.gif',
    '/assets/consoleon3.gif'
  ];

  useEffect(() => {
    if (isActive && !isAnimating) {
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
    } else if (!isActive) {
      setCurrentFrame(0);
      setIsAnimating(false);
    }
  }, [isActive, isAnimating]);

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
