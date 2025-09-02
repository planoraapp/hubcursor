
import React from 'react';
import { Button } from '@/components/ui/button';

interface SkinToneBarProps {
  currentSkinTone: string;
  onSkinToneChange: (skinTone: string) => void;
}

const SkinToneBar: React.FC<SkinToneBarProps> = ({
  currentSkinTone,
  onSkinToneChange
}) => {
  const skinTones = [
    { id: '1', color: '#FFE0C6', name: 'Tom 1' },
    { id: '2', color: '#FFDBBA', name: 'Tom 2' },
    { id: '3', color: '#F5C99B', name: 'Tom 3' },
    { id: '4', color: '#E6AC7C', name: 'Tom 4' },
    { id: '5', color: '#D4926B', name: 'Tom 5' },
    { id: '6', color: '#C17D5D', name: 'Tom 6' },
    { id: '7', color: '#A66B50', name: 'Tom 7' },
    { id: '8', color: '#8B5A42', name: 'Tom 8' }
  ];

  return (
    <div className="bg-white border-2 border-black p-3">
      <div className="text-sm font-bold mb-2 text-center">Tom de Pele</div>
      
      {/* Color Slider Visual */}
      <div className="mb-3">
        <div className="h-4 bg-gradient-to-r rounded border border-gray-300" style={{
          background: `linear-gradient(to right, ${skinTones.map(tone => tone.color).join(', ')})`
        }} />
      </div>

      {/* Color Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {skinTones.map((tone) => (
          <Button
            key={tone.id}
            onClick={() => onSkinToneChange(tone.id)}
            className={`w-8 h-8 p-0 border-2 rounded-full ${
              currentSkinTone === tone.id ? 'border-blue-500' : 'border-gray-400'
            }`}
            style={{ backgroundColor: tone.color }}
            title={tone.name}
          />
        ))}
      </div>
    </div>
  );
};

export default SkinToneBar;
