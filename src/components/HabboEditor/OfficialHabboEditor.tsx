import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, User, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashAssetsTab } from '@/components/HabboEditor/FlashAssetsTab';
import { getAvatarUrl } from '@/services/habboApiMultiHotel';
import { toast } from 'sonner';

export const OfficialHabboEditor: React.FC = () => {
  const [figureString, setFigureString] = useState('hr-100-40.ch-210-66.lg-270-82.sh-290-81.hd-180-1.fa-1201');
  const [activeTab, setActiveTab] = useState('flash-assets');

  const copyFigureString = useCallback(() => {
    navigator.clipboard.writeText(figureString);
    toast.success('Código do avatar copiado!');
  }, [figureString]);

  const handleItemSelect = (item: any) => {
    if (!item) return;

    let newFigureString = figureString;

    // Extract the category (e.g., "hd", "ch", "lg") from the item
    const category = item.part.substring(0, 2);

    // Create a regex to find the existing part in the figureString
    const regex = new RegExp(`${category}-\\d+`, 'g');

    // Replace the existing part with the new item
    if (newFigureString.match(regex)) {
      newFigureString = newFigureString.replace(regex, `${item.part}`);
    } else {
      // If the category doesn't exist, append it
      newFigureString += `.${item.part}`;
    }

    setFigureString(newFigureString);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800 volter-font">
          Editor de Avatar Habbo
        </h1>
        <p className="text-lg text-gray-600">
          Crie e personalize seu avatar usando nossa base completa de roupas e acessórios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Preview do Avatar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                <img
                  src={getAvatarUrl(figureString)}
                  alt="Preview do Avatar"
                  className="max-w-full max-h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Código do Avatar:</Label>
                <div className="flex gap-2">
                  <Input
                    value={figureString}
                    onChange={(e) => setFigureString(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={copyFigureString}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Personalização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="flash-assets">Flash Assets - Database</TabsTrigger>
                  <TabsTrigger value="official-api">API Oficial</TabsTrigger>
                </TabsList>
                
                <TabsContent value="flash-assets" className="mt-4">
                  <FlashAssetsTab onItemSelect={handleItemSelect} />
                </TabsContent>
                
                <TabsContent value="official-api" className="mt-4">
                  <div className="text-center p-8 text-gray-500">
                    <p>API Oficial em desenvolvimento</p>
                    <p className="text-sm mt-2">Esta aba utilizará dados direto da API oficial do Habbo</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
