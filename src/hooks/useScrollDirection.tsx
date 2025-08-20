import { useState, useEffect } from 'react';

export const useScrollDirection = (element?: HTMLElement | null) => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const targetElement = element || window;

    const handleScroll = () => {
      const currentScrollY = element ? element.scrollTop : window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [lastScrollY, element]);

  return scrollDirection;
};