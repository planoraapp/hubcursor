import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, X } from 'lucide-react';

interface Badge {
  code: string;
  name: string;
  description: string;
}

interface BadgesModalProps {
  badges: Badge[];
  isOpen: boolean;
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ badges, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-black rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black bg-yellow-500">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Emblemas ({badges.length})
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-black hover:bg-black/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div key={badge.code} className="flex items-center space-x-3 p-3 bg-white/10 rounded border border-black">
                <div className="w-12 h-12 bg-yellow-500 rounded flex items-center justify-center text-black font-bold text-sm">
                  {String(badge.code)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{badge.name}</div>
                  <div className="text-xs text-white/60">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
