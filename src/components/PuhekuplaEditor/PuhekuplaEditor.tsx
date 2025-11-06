
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Palette, Sparkles, Download, Share } from 'lucide-react';
import { toast } from 'sonner';
import HabboEmotionClothingGrid from './HabboEmotionClothingGrid';
import { UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';
import { useI18n } from '@/contexts/I18nContext';

interface PuhekuplaEditorProps {
  
}

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  colors: string[];
  imageUrl: string;
  club: 'HC' | 'FREE';
  source: string;
}

export const PuhekuplaEditor: React.FC<PuhekuplaEditorProps> = () => {
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);
  const [avatarFigure, setAvatarFigure] = useState<string>('');
  const [avatarName, setAvatarName] = useState<string>('HabboHub');
  const [bubbleText, setBubbleText] = useState<string>('Olá, mundo!');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleClothingSelect = (item: UnifiedClothingItem) => {
    setSelectedClothing(item);
    
    const figureParts = [
      `hd-${Math.floor(Math.random() * 200)}-1`,
      `ch-${Math.floor(Math.random() * 200)}-1`,
      `lg-${Math.floor(Math.random() * 200)}-1`,
      `sh-${Math.floor(Math.random() * 200)}-1`
    ];

    if (item) {
      figureParts[0] = `hd-180-1`;
      figureParts[1] = `ch-${item.figureId}-${item.colors[0]}`;
    }

    setAvatarFigure(figureParts.join('.'));
  };

  const { t } = useI18n();
  
  const handleDownload = () => {
    toast.success(t('toast.downloadStarted'));
  };

  const handleShare = () => {
    toast.message('Link copiado para a área de transferência!');
  };

  return (
    <Card className="habbo-panel">
      <CardHeader className="habbo-header">
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          Editor Puhekupla
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor" className="text-sm font-medium">
              Editor
            </TabsTrigger>
            <TabsTrigger value="roupas" className="text-sm font-medium">
              Roupas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Avatar Preview */}
              <Card className="bg-gray-100 border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <Avatar className="w-32 h-32 relative">
                    <AvatarImage 
                      src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${avatarFigure}&size=l&direction=2&head_direction=3&gesture=sml`}
                      alt="Avatar Preview"
                      className="rounded-none"
                    />
                    <AvatarFallback className="bg-red-500">
                      {avatarName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-2 text-center">
                    <h3 className="text-lg font-semibold">{avatarName}</h3>
                    <Badge variant="secondary">
                      {selectedClothing ? selectedClothing.name : 'Sem roupa'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Bubble Editor */}
              <Card className="bg-gray-100 border-2 border-gray-300">
                <CardContent className="space-y-4 p-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Texto da Puhekupla:</h4>
                    <textarea
                      className="w-full h-24 p-2 border rounded-md focus:ring focus:ring-blue-200"
                      value={bubbleText}
                      onChange={(e) => setBubbleText(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" onClick={handleShare}>
                      <Share className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roupas">
            <HabboEmotionClothingGrid
              selectedCategory={selectedCategory}
              selectedGender={selectedGender}
              onItemSelect={handleClothingSelect}
              onColorSelect={() => {}}
              selectedItem={selectedClothing?.id || ''}
              selectedColor="1"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PuhekuplaEditor;
