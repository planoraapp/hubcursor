
import React from 'react';
import { Button } from '@/components/ui/button';

interface GenderFilterButtonsProps {
  currentGender: 'M' | 'F' | 'U';
  onGenderChange: (gender: 'M' | 'F' | 'U') => void;
}

const GenderFilterButtons: React.FC<GenderFilterButtonsProps> = ({
  currentGender,
  onGenderChange
}) => {
  const genders = [
    { id: 'M' as const, label: 'Masculino', icon: '♂' },
    { id: 'F' as const, label: 'Feminino', icon: '♀' },
    { id: 'U' as const, label: 'Unissex', icon: '⚧' }
  ];

  return (
    <div className="flex gap-1">
      {genders.map((gender) => (
        <Button
          key={gender.id}
          onClick={() => onGenderChange(gender.id)}
          size="sm"
          variant={currentGender === gender.id ? "default" : "outline"}
          className={`border-black ${
            currentGender === gender.id 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-gray-100'
          }`}
          title={gender.label}
        >
          {gender.icon}
        </Button>
      ))}
    </div>
  );
};

export default GenderFilterButtons;
