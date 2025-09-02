
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface GenderButtonsProps {
  selectedGender: 'M' | 'F';
  onGenderChange: (gender: 'M' | 'F') => void;
}

export const GenderButtons: React.FC<GenderButtonsProps> = ({
  selectedGender,
  onGenderChange
}) => {
  return (
    <div className="mb-4">
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        Gênero
      </Label>
      <div className="flex gap-2">
        <Button
          variant={selectedGender === 'M' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onGenderChange('M')}
          className="flex-1"
        >
          👨 Masculino
        </Button>
        <Button
          variant={selectedGender === 'F' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onGenderChange('F')}
          className="flex-1"
        >
          👩 Feminino
        </Button>
      </div>
    </div>
  );
};

export default GenderButtons;
