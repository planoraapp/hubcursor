import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Palette, Sticker, Settings, Save } from 'lucide-react';

interface EnhancedHomeHeaderProps {
  username: string;
  hotel: string;
  isOwner: boolean;
  isEditMode: boolean;
  onEditModeToggle: () => void;
  onOpenStickers: () => void;
  onOpenBackgrounds: () => void;
  onOpenWidgets: () => void;
}

export const EnhancedHomeHeader: React.FC<EnhancedHomeHeaderProps> = ({
  username,
  hotel,
  isOwner,
  isEditMode,
  onEditModeToggle,
  onOpenStickers,
  onOpenBackgrounds,
  onOpenWidgets
}) => {
  return (
    <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-black">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl volter-font habbo-outline-lg flex items-center gap-2">
              🏠 {username}'s Habbo Home
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-white/20 text-white volter-font habbo-outline-sm">
                Hotel: {hotel.toUpperCase()}
              </Badge>
              <Badge className="bg-white/20 text-white volter-font habbo-outline-sm">
                Enhanced Home
              </Badge>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                onClick={onEditModeToggle}
                variant={isEditMode ? "secondary" : "outline"}
                className={`volter-font habbo-outline-sm ${isEditMode ? 'bg-yellow-400 text-black' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {isEditMode ? 'Sair da Edição' : 'Editar'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      {isOwner && isEditMode && (
        <CardContent className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-yellow-200">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={onOpenStickers}
              variant="outline"
              className="volter-font bg-white hover:bg-blue-50 border-2 border-blue-300"
            >
              <Sticker className="w-4 h-4 mr-1" />
              Stickers
            </Button>
            
            <Button
              onClick={onOpenBackgrounds}
              variant="outline"
              className="volter-font bg-white hover:bg-green-50 border-2 border-green-300"
            >
              <Palette className="w-4 h-4 mr-1" />
              Fundos
            </Button>
            
            <Button
              onClick={onOpenWidgets}
              variant="outline"
              className="volter-font bg-white hover:bg-purple-50 border-2 border-purple-300"
            >
              <Settings className="w-4 h-4 mr-1" />
              Widgets
            </Button>

            <div className="text-sm text-gray-800 volter-font ml-4">
              💡 Use os botões acima para personalizar sua home!
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
