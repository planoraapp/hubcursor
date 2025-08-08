
import { Button } from '@/components/ui/button';

interface GenderFilterButtonsProps {
  selectedGender: 'M' | 'F' | 'U';
  onGenderSelect: (gender: 'M' | 'F' | 'U') => void;
}

export const GenderFilterButtons = ({
  selectedGender,
  onGenderSelect
}: GenderFilterButtonsProps) => {
  
  const genderOptions = [
    { 
      value: 'M' as const, 
      label: 'Masculino',
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/male.png',
      emoji: '👨'
    },
    { 
      value: 'F' as const, 
      label: 'Feminino',
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/female.png',
      emoji: '👩'
    },
    { 
      value: 'U' as const, 
      label: 'Unissex',
      icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/editor_images/unisex.png',
      emoji: '👤'
    }
  ];

  return (
    <div className="flex gap-1 mb-4">
      {genderOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedGender === option.value ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2 text-xs"
          onClick={() => onGenderSelect(option.value)}
          title={option.label}
        >
          <img
            src={option.icon}
            alt={option.label}
            className="w-4 h-4"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.emoji-fallback')) {
                const span = document.createElement('span');
                span.className = 'emoji-fallback';
                span.textContent = option.emoji;
                parent.appendChild(span);
              }
            }}
          />
          {option.label}
        </Button>
      ))}
    </div>
  );
};
