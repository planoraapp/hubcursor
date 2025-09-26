import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Database, Zap, Shield, Settings, Download, Share2 } from 'lucide-react';
import OptimizedAvatarRenderer from './OptimizedAvatarRenderer';
import OptimizedClothingGrid from './OptimizedClothingGrid';
import { UnifiedHabboClothingItem } from '@/hooks/useUnifiedHabboClothing';
import { useLookStringManager } from '@/utils/lookStringManager';
import { useToast } from '@/hooks/use-toast';

const categoryGroups = [
  {
    id: 'head',
    name: 'Cabeça e Acessórios',
    icon: '👤',
    categories: [
      { id: 'hd', name: 'Rostos', icon: '👤' },
      { id: 'hr', name: 'Cabelos', icon: '💇' },
      { id: 'ha', name: 'Chapéus', icon: '🎩' },
      { id: 'ea', name: 'Óculos', icon: '��' }
    ]
  },
  {
    id: 'body', 
    name: 'Corpo e Roupas',
    icon: '👕',
    categories: [
      { id: 'ch', name: 'Camisetas', icon: '👕' },
      { id: 'cc', name: 'Casacos', icon: '🧥' },
      { id: 'ca', name: 'Acess. Peito', icon: '��️' },
      { id: 'cp', name: 'Estampas', icon: '��' }
    ]
  },
  {
    id: 'legs',
    name: 'Calças e Pés', 
    icon: '👖',
    categories: [
      { id: 'lg', name: 'Calças', icon: '👖' },
      { id: 'sh', name: 'Sapatos', icon: '👟' },
      { id: 'wa', name: 'Cintura', icon: '🔗' }
    ]
  }
];

const AdvancedHabboEditor: React.FC = () => {
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [selectedSection, setSelectedSection] = useState('head');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedColor, setSelectedColor] = useState('1');
  
  const { toast } = useToast();
  const { 
    lookString, 
    addPart, 
    removePart, 
    loadFromString, 
    clear, 
    getPart, 
    hasPart, 
    getAllParts,
    getStats 
  } = useLookStringManager();

  const handleItemSelect = useCallback((item: UnifiedHabboClothingItem, colorId: string = '1') => {
        addPart(item.category, item.figureId, colorId);
    setSelectedColor(colorId);
    
    const sourceBadges = {
      'viajovem': '�� ViaJovem',
      'habbowidgets': '🔵 HabboWidgets', 
      'official-habbo': '🟣 Oficial',
      'flash-assets': '🟠 Flash Assets'
    };
    
    toast({
      title: "✅ Item aplicado!",
      description: `${item.name} (${sourceBadges[item.source as keyof typeof sourceBadges] || item.source}) foi aplicado com ID real ${item.figureId}.`,
    });
  }, [addPart, toast]);

  const handleRemoveItem = useCallback((category: string) => {
        removePart(category);
    
    toast({
      title: "🗑️ Item removido",
      description: `Item da categoria ${category.toUpperCase()} removido.`,
    });
  }, [removePart, toast]);

  const handleResetAvatar = useCallback(() => {
    clear();
    
        toast({
      title: "�� Avatar resetado",
      description: "Avatar voltou ao estado padrão.",
    });
  }, [clear, toast]);

  useEffect(() => {
    const currentGroup = categoryGroups.find(group => group.id === selectedSection);
    if (currentGroup && currentGroup.categories.length > 0) {
      setSelectedCategory(currentGroup.categories[0].id);
    }
  }, [selectedSection]);

  const stats = getStats();

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Avatar Preview Otimizado */}
      <div className="lg:w-80">
        <OptimizedAvatarRenderer
          initialLookString={lookString}
          selectedGender={selectedGender}
          selectedHotel={selectedHotel}
          onLookStringChange={(newLookString) => {
            if (newLookString !== lookString) {
              loadFromString(newLookString);
            }
          }}
        />
      </div>

      {/* Editor Avançado */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              HabboHub - Editor Avançado com Cache Inteligente
              <div className="ml-auto flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-200 text-xs flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Cache
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-200 text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Otimizado
                </Badge>
