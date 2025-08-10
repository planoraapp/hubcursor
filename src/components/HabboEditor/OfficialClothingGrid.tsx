
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';

interface OfficialClothingGridProps {
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: ViaJovemFlashItem, colorId?: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const OfficialClothingGrid: React.FC<OfficialClothingGridProps> = ({
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem,
  selectedColor,
  className
}) => {
  // Mock data with all required properties including thumbnailUrl
  const mockItems: ViaJovemFlashItem[] = [
    {
      id: '1',
      name: 'Test Hair',
      type: 'hd',
      category: 'hair',
      gender: selectedGender,
      figureId: 'hd-180',
      colors: ['1', '2', '3'],
      thumbnail: 'https://via.placeholder.com/64',
      thumbnailUrl: 'https://via.placeholder.com/64',
      club: 'normal',
      swfName: 'hd-180.swf',
      source: 'official'
    },
    {
      id: '2',
      name: 'Test Shirt',
      type: 'ch',
      category: 'shirt',
      gender: selectedGender,
      figureId: 'ch-255',
      colors: ['1', '2', '3'],
      thumbnail: 'https://via.placeholder.com/64',
      thumbnailUrl: 'https://via.placeholder.com/64',
      club: 'hc',
      swfName: 'ch-255.swf',
      source: 'official'
    }
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Official Habbo Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {mockItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemSelect(item, '1')}
                className={`p-2 border-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedItem === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-12 object-contain"
                />
                <p className="text-xs text-center mt-1 truncate">{item.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficialClothingGrid;
