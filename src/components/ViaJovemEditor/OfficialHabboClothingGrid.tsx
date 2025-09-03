
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OfficialHabboClothingGridProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: any, colorId?: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

export const OfficialHabboClothingGrid: React.FC<OfficialHabboClothingGridProps> = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor,
  className
}) => {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Official Habbo Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Official Habbo clothing grid coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficialHabboClothingGrid;
