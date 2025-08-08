
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EditModeHelpBarProps {
  isVisible: boolean;
}

export const EditModeHelpBar: React.FC<EditModeHelpBarProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
      <Card className="bg-yellow-50 border-2 border-yellow-400 shadow-lg">
        <div className="px-4 py-3 flex items-center gap-4">
          <Badge className="bg-yellow-500 text-black volter-font habbo-outline-sm">
            🔧 Modo Edição
          </Badge>
          <div className="flex items-center gap-6 text-sm volter-font habbo-outline-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">✨</span>
              <span>Clique em <strong>Stickers</strong> para adicionar itens</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">🎨</span>
              <span>Clique em <strong>Fundos</strong> para trocar o background</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">🖱️</span>
              <span>Arraste stickers para reposicionar</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
