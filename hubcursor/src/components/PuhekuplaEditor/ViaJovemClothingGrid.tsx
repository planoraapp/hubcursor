
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ViaJovemClothingGridProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  currentFigureString: string;
  onRestoreFigure: (figureString: string) => void;
  className?: string;
}

const ViaJovemClothingGrid: React.FC<ViaJovemClothingGridProps> = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor,
  currentFigureString,
  onRestoreFigure,
  className
}) => {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>ViaJovem Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            ViaJovem clothing grid coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViaJovemClothingGrid;
