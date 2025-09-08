import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RotateCcw, Copy, RefreshCw, User, User2 } from 'lucide-react';
import { ClothingItem, CATEGORIES, generateImageUrl } from '@/hooks/useOfficialClothingData';
import ClothingGrid from './ClothingGrid';

const SimpleClothingEditor: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('hr');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [avatarFigure, setAvatarFigure] = useState('hd-180-1.hr-115-31.ch-215-62.lg-280-62.sh-305-62');
  const [avatarOptions, setAvatarOptions] = useState({
    size: 'l',
    direction: '2',
    headDirection: '3',
    gesture: 'std',
    frame: '0'
  });

  // Função para atualizar figure string
  const updateFigureString = useCallback((item: ClothingItem, colorId: string) => {
    const parts = avatarFigure.split('.');
    const categoryIndex = parts.findIndex(part => part.startsWith(item.category));
    const newPart = `${item.category}-${item.figureId}-${colorId}`;
    
    if (categoryIndex >= 0) {
      parts[categoryIndex] = newPart;
    } else {
      parts.push(newPart);
    }
    
    setAvatarFigure(parts.join('.'));
  }, [avatarFigure]);

  // Função para randomizar avatar
  const randomizeAvatar = useCallback(() => {
    const randomParts = [
      `hd-180-${Math.floor(Math.random() * 8) + 1}`,
      `hr-${Math.floor(Math.random() * 200) + 100}-${Math.floor(Math.random() * 100) + 1}`,
      `ch-${Math.floor(Math.random() * 300) + 200}-${Math.floor(Math.random() * 100) + 1}`,
      `lg-${Math.floor(Math.random() * 300) + 250}-${Math.floor(Math.random() * 100) + 1}`,
      `sh-${Math.floor(Math.random() * 300) + 300}-${Math.floor(Math.random() * 100) + 1}`
    ];
    setAvatarFigure(randomParts.join('.'));
  }, []);

  // Função para limpar avatar
  const clearAvatar = useCallback(() => {
    setAvatarFigure('hd-180-1');
  }, []);

  // Função para copiar figure string
  const copyFigureString = useCallback(() => {
    navigator.clipboard.writeText(avatarFigure);
  }, [avatarFigure]);

  // Função para baixar avatar
  const downloadAvatar = useCallback(() => {
    const avatarUrl = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${avatarFigure}&size=${avatarOptions.size}&direction=${avatarOptions.direction}&head_direction=${avatarOptions.headDirection}&gesture=${avatarOptions.gesture}&frame=${avatarOptions.frame}`;
    
    const link = document.createElement('a');
    link.href = avatarUrl;
    link.download = `habbo-avatar-${Date.now()}.png`;
    link.click();
  }, [avatarFigure, selectedHotel, avatarOptions]);

  // Gerar URL do avatar
  const avatarUrl = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${avatarFigure}&size=${avatarOptions.size}&direction=${avatarOptions.direction}&head_direction=${avatarOptions.headDirection}&gesture=${avatarOptions.gesture}&frame=${avatarOptions.frame}`;

  return (
    <div className="simple-clothing-editor h-screen flex bg-gray-50">
      {/* Sidebar de Categorias */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Editor de Visuais</h2>
          
          {/* Controles de Gênero e Hotel */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Gênero</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedGender === 'M' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGender('M')}
                  className="flex-1"
                >
                  <User className="w-4 h-4 mr-1" />
                  Masculino
                </Button>
                <Button
                  variant={selectedGender === 'F' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGender('F')}
                  className="flex-1"
                >
                  <User2 className="w-4 h-4 mr-1" />
                  Feminino
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Hotel</label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="com.br">Habbo.com.br</SelectItem>
                  <SelectItem value="com">Habbo.com</SelectItem>
                  <SelectItem value="es">Habbo.es</SelectItem>
                  <SelectItem value="fr">Habbo.fr</SelectItem>
                  <SelectItem value="de">Habbo.de</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Categorias</h3>
          <div className="space-y-1">
            {Object.entries(CATEGORIES).map(([id, category]) => (
              <Button
                key={id}
                variant={selectedCategory === id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(id)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            onClick={randomizeAvatar}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Randomizar
          </Button>
          <Button
            onClick={clearAvatar}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col">
        {/* Grid de Roupas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.icon} {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name}
            </h3>
            <p className="text-sm text-gray-600">
              Selecione uma roupa para personalizar seu avatar
            </p>
          </div>
          
          <ClothingGrid
            category={selectedCategory}
            gender={selectedGender}
            hotel={selectedHotel}
            onItemSelect={updateFigureString}
            selectedItem={avatarFigure.split('.').find(part => part.startsWith(selectedCategory))?.split('-')[1]}
          />
        </div>
      </div>

      {/* Sidebar de Preview */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Preview do Avatar */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
          
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <img
                src={avatarUrl}
                alt="Avatar Preview"
                className="w-full max-w-48 mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/avatar-placeholder.png';
                }}
              />
            </div>
            
            {/* Controles do Avatar */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Tamanho</label>
                  <Select value={avatarOptions.size} onValueChange={(value) => setAvatarOptions(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s">Pequeno</SelectItem>
                      <SelectItem value="m">Médio</SelectItem>
                      <SelectItem value="l">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Direção</label>
                  <Select value={avatarOptions.direction} onValueChange={(value) => setAvatarOptions(prev => ({ ...prev, direction: value }))}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">Frente</SelectItem>
                      <SelectItem value="4">Esquerda</SelectItem>
                      <SelectItem value="6">Direita</SelectItem>
                      <SelectItem value="0">Costas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Expressão</label>
                  <Select value={avatarOptions.gesture} onValueChange={(value) => setAvatarOptions(prev => ({ ...prev, gesture: value }))}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="std">Normal</SelectItem>
                      <SelectItem value="sml">Sorriso</SelectItem>
                      <SelectItem value="sad">Triste</SelectItem>
                      <SelectItem value="agr">Bravo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Frame</label>
                  <Select value={avatarOptions.frame} onValueChange={(value) => setAvatarOptions(prev => ({ ...prev, frame: value }))}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Figure String e Ações */}
        <div className="flex-1 p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Figure String</h4>
            <div className="bg-gray-100 rounded-lg p-3">
              <code className="text-xs break-all text-gray-800">
                {avatarFigure}
              </code>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={copyFigureString}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Figure String
            </Button>
            
            <Button
              onClick={downloadAvatar}
              variant="default"
              size="sm"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Avatar
            </Button>
          </div>
          
          {/* Estatísticas */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Estatísticas</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Partes:</span>
                <span>{avatarFigure.split('.').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Hotel:</span>
                <span>{selectedHotel}</span>
              </div>
              <div className="flex justify-between">
                <span>Gênero:</span>
                <span>{selectedGender === 'M' ? 'Masculino' : 'Feminino'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleClothingEditor;
