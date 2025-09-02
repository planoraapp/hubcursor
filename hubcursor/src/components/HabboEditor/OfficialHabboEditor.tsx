
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Palette, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashAssetsTab } from '@/components/HabboEditor/FlashAssetsTab';
import { ImprovedAvatarPreview } from '@/components/HabboEditor/ImprovedAvatarPreview';
import { generateFigureString } from '@/lib/figureStringGenerator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const OfficialHabboEditor: React.FC = () => {
  const [figureString, setFigureString] = useState('hr-100-40.ch-210-66.lg-270-82.sh-290-81.hd-180-1');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [activeTab, setActiveTab] = useState('flash-assets');
  const { toast } = useToast();

  const handleItemSelect = useCallback((item: any) => {
    if (!item) {
      console.warn('⚠️ No item provided to handleItemSelect');
      return;
    }

    console.log('🎨 [OfficialHabboEditor] Item selected:', item);

    try {
      // Use the first available color as default
      const colorId = Array.isArray(item.colors) && item.colors.length > 0 ? item.colors[0] : '1';
      
      const newFigureString = generateFigureString(figureString, item, colorId);
      setFigureString(newFigureString);
      
      toast({
        title: "✨ Item aplicado!",
        description: `${item.name || item.category} foi aplicado ao avatar`,
      });
      
      console.log('✅ [OfficialHabboEditor] Figure updated:', newFigureString);
    } catch (error) {
      console.error('❌ [OfficialHabboEditor] Error applying item:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível aplicar o item",
        variant: "destructive"
      });
    }
  }, [figureString, toast]);

  const handleReset = useCallback(() => {
    const defaultFigure = selectedGender === 'F' 
      ? 'hr-515-45.ch-210-66.lg-270-82.sh-290-1.hd-180-1'
      : 'hr-100-40.ch-210-66.lg-270-82.sh-290-81.hd-180-1';
    
    setFigureString(defaultFigure);
    toast({
      title: "🔄 Avatar resetado",
      description: "Avatar voltou ao padrão",
    });
  }, [selectedGender, toast]);

  const handlePopulateCache = async () => {
    try {
      toast({
        title: "🔄 Iniciando",
        description: "Populando cache de roupas...",
      });

      const { data, error } = await supabase.functions.invoke('populate-clothing-cache');
      
      if (error) throw error;
      
      toast({
        title: "✅ Sucesso!",
        description: `Cache populado com ${data.totalInserted} itens`,
      });
    } catch (error) {
      console.error('❌ Error populating cache:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao popular cache de roupas",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800 volter-font">
          🎨 Editor de Avatar Habbo
        </h1>
        <p className="text-lg text-gray-600">
          Crie e personalize seu avatar usando nossa base completa de roupas e acessórios
        </p>
        
        {/* Quick Actions */}
        <div className="flex justify-center gap-2">
          <Button onClick={handlePopulateCache} variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-1" />
            Popular Cache
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <ImprovedAvatarPreview
            figureString={figureString}
            selectedGender={selectedGender}
            selectedHotel={selectedHotel}
            onGenderChange={setSelectedGender}
            onHotelChange={setSelectedHotel}
            onReset={handleReset}
          />
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
                  <TabsTrigger value="flash-assets">Database de Roupas</TabsTrigger>
                  <TabsTrigger value="official-api">API Oficial</TabsTrigger>
                </TabsList>
                
                <TabsContent value="flash-assets" className="mt-4">
                  <FlashAssetsTab onItemSelect={handleItemSelect} />
                </TabsContent>
                
                <TabsContent value="official-api" className="mt-4">
                  <div className="text-center p-8 text-gray-500 space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-700">API Oficial</h3>
                      <p className="text-sm mt-2">Esta aba utilizará dados direto da API oficial do Habbo</p>
                      <p className="text-xs text-gray-400 mt-1">Em desenvolvimento</p>
                    </div>
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

export default OfficialHabboEditor;
