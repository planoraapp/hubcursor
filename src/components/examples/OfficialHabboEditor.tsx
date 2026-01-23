// src/components/examples/OfficialHabboEditor.tsx
// Exemplo de uso do novo sistema oficial de dados do Habbo

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HabboHubClothingGrid } from '@/components/HabboHub/HabboHubClothingGrid';
import { HABBO_CLOTHING_SETS, generateHabboImageUrl } from '@/services/HabboData';

export const OfficialHabboEditor: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('hr'); // Começar com cabelo
  const [selectedGender, setSelectedGender] = useState<'M' | 'F' | 'U' | 'all'>('all');
  const [selectedColor, setSelectedColor] = useState('7');
  const [selectedItem, setSelectedItem] = useState<string>();

  // Avatar figure atual (simulação)
  const [currentFigure, setCurrentFigure] = useState('hr-100-61');

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);

    // Atualizar o figure do avatar
    const newFigurePart = `${activeCategory}-${itemId}-${selectedColor}`;
    setCurrentFigure(newFigurePart);
  };

  const getAvatarPreviewUrl = () => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${currentFigure}&gender=M&direction=2&head_direction=2&size=l&img_format=png`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Editor Oficial Habbo Avatar
          </h1>
          <p className="text-white/70">
            Usando dados validados diretamente do figuremap.xml oficial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Painel de Controle */}
          <div className="lg:col-span-1 space-y-4">

            {/* Avatar Preview */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  👤 Avatar Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 flex justify-center">
                  <img
                    src={getAvatarPreviewUrl()}
                    alt="Avatar Preview"
                    className="h-48 w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI2NCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5FTiBBVkFUQVI8L3RleHQ+Cjwvc3ZnPg==';
                    }}
                  />
                </div>

                {/* Figure atual */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Figure Atual:</label>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {currentFigure}
                  </Badge>
                </div>

                {/* Controles de Gênero */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Gênero:</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'Todos', icon: '👥' },
                      { id: 'M', label: 'Masculino', icon: '👨' },
                      { id: 'F', label: 'Feminino', icon: '👩' },
                      { id: 'U', label: 'Unissex', icon: '🧑' }
                    ].map((gender) => (
                      <Button
                        key={gender.id}
                        variant={selectedGender === gender.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedGender(gender.id as any)}
                        className={`flex-1 ${
                          selectedGender === gender.id
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                        }`}
                      >
                        <span className="mr-1">{gender.icon}</span>
                        {gender.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Notas sobre funcionalidades */}
                <div className="space-y-2 space-x-2">
                  <div className="text-xs text-white/50 bg-white/10 rounded p-2 inline-block">
                    💡 <strong>Miniaturas:</strong> Usam cor padrão (cinza) para consistência. Cor real aplicada no avatar.
                  </div>
                  <div className="text-xs text-white/50 bg-white/10 rounded p-2 inline-block">
                    🖱️ <strong>Hover:</strong> Passe o mouse sobre itens para ver o nome do visual (ex: "shirt_F_trippyshirt_hearts_nft").
                  </div>
                  <div className="text-xs text-white/50 bg-white/10 rounded p-2 inline-block">
                    👑 <strong>HC:</strong> Itens com coroa são exclusivos do Habbo Club.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📊 Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Categorias:</span>
                  <span>{HABBO_CLOTHING_SETS.length}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Total de Itens:</span>
                  <span>{HABBO_CLOTHING_SETS.reduce((acc, cat) => acc + cat.sets.length, 0)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Itens HC:</span>
                  <span>{HABBO_CLOTHING_SETS.reduce((acc, cat) => acc + cat.sets.filter(s => s.club).length, 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grid de Roupas */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  👕 Seleção de Roupas
                </CardTitle>
              </CardHeader>
              <CardContent>

                {/* Navegação de Categorias */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {HABBO_CLOTHING_SETS.map((category) => (
                      <Button
                        key={category.type}
                        variant={activeCategory === category.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(category.type)}
                        className={`${
                          activeCategory === category.type
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                        }`}
                      >
                        {category.label} ({category.sets.length})
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/20 mb-6" />

                {/* Grid de Itens */}
                <HabboHubClothingGrid
                  activeCategory={activeCategory}
                  selectedGender={selectedGender}
                  selectedColor={selectedColor}
                  onItemSelect={handleItemSelect}
                  selectedItem={selectedItem}
                />

              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer com informações */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <div className="text-center text-white/70 space-y-2">
              <p>
                🎯 <strong>Dados Oficiais:</strong> Este editor usa apenas IDs validados do figuremap.xml oficial do Habbo.
              </p>
              <p>
                🔒 <strong>Garantia:</strong> Todos os IDs foram extraídos diretamente da fonte oficial, garantindo imagens válidas.
              </p>
              <p>
                📚 <strong>Fonte:</strong>{' '}
                <a
                  href="https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601121522-867048149/figuremap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-100 underline"
                >
                  figuremap.xml oficial
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};