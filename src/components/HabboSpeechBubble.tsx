
import React from 'react';

interface HabboSpeechBubbleProps {
  text: string;
  variant?: 'default' | 'system' | 'whisper';
  className?: string;
}

export const HabboSpeechBubble: React.FC<HabboSpeechBubbleProps> = ({
  text,
  variant = 'default',
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'system':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'whisper':
        return 'bg-purple-100 border-purple-500 text-purple-800';
      default:
        return 'bg-white border-black text-black';
    }
  };

  return (
    <div className={`habbo-speech-bubble ${getVariantStyles()} ${className}`}>
      {text}
    </div>
  );
};
