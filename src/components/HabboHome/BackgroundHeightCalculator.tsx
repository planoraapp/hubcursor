
import { useEffect } from 'react';

interface BackgroundAsset {
  category: string;
  name: string;
  type: 'image' | 'pattern';
  src: string;
}

interface BackgroundHeightCalculatorProps {
  backgrounds: BackgroundAsset[];
  onHeightCalculated: (height: number) => void;
}

export const BackgroundHeightCalculator: React.FC<BackgroundHeightCalculatorProps> = ({
  backgrounds,
  onHeightCalculated
}) => {
  useEffect(() => {
    const calculateMaxHeight = async () => {
      // Check localStorage first
      const cachedHeight = localStorage.getItem('habboHomeMaxHeight');
      if (cachedHeight) {
        const height = parseInt(cachedHeight, 10);
        document.documentElement.style.setProperty('--homeMaxHeight', `${height}px`);
        onHeightCalculated(height);
        return;
      }

      // Filter only large images (not patterns)
      const largeImages = backgrounds.filter(bg => 
        bg.category === 'Papel de Parede' && bg.type === 'image'
      );

      if (largeImages.length === 0) {
        return; // Use default height from CSS
      }

      const heights = await Promise.all(
        largeImages.map(bg => 
          new Promise<number>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img.naturalHeight);
            img.onerror = () => resolve(1200); // fallback
            img.src = bg.src;
          })
        )
      );

      const maxHeight = Math.max(...heights, 1200); // minimum 1200px
      
      // Cache the result
      localStorage.setItem('habboHomeMaxHeight', maxHeight.toString());
      
      // Apply to CSS variable
      document.documentElement.style.setProperty('--homeMaxHeight', `${maxHeight}px`);
      
      onHeightCalculated(maxHeight);
    };

    calculateMaxHeight();
  }, [backgrounds, onHeightCalculated]);

  return null; // This component only performs calculations
};
