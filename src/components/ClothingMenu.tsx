// src/components/ClothingMenu.tsx
import React, { useState, useEffect } from 'react';
import { clothingParts, colorPalettes, subNavCategories, ClothingPart } from '../data/clothingItems';

interface ClothingMenuProps {
  currentLook: string;
  onLookChange: (newLook: string) => void;
  onGenderChange: (gender: 'M' | 'F') => void;
  currentGender: 'M' | 'F';
}

const ClothingMenu: React.FC<ClothingMenuProps> = ({ currentLook, onLookChange, onGenderChange, currentGender }) => {
  const [activeMainCategory, setActiveMainCategory] = useState<string>('hd');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>(currentGender);
  const [selectedPartForColor, setSelectedPartForColor] = useState<{ type: string; id: number; colors: string[] } | null>(null);

  // Efeito para sincronizar o gênero com o componente pai
  useEffect(() => {
    setSelectedGender(currentGender);
  }, [currentGender]);

  // Função para gerar a URL da miniatura de uma peça de roupa
  const getPreviewUrl = (itemType: string, itemId: number, gender: 'M' | 'F', colors: string[] = ['7', '7', '7']) => {
    // Garante que haja pelo menos 3 cores para o figure, usando '7' como padrão se ausente
    const figColors = colors.slice(0, 3).concat(['7', '7', '7']).slice(0, 3); // Preenche até 3 cores
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${itemType}-${itemId}-${figColors[0]}-${figColors[1] || ''}-${figColors[2] || ''}&gender=${gender}&size=s&headonly=0`;
  };

  // Lida com a mudança da categoria principal (botões superiores)
  const handleMainCategoryClick = (type: string) => {
    setActiveMainCategory(type);
    setSearchTerm(''); // Limpa a busca ao mudar de categoria
    setSelectedPartForColor(null); // Desseleciona a peça para cor ao mudar de categoria
  };

  // Lida com a seleção de gênero (quando na categoria "Corpo/Rostos")
  const handleGenderSelect = (gender: 'M' | 'F') => {
    setSelectedGender(gender);
    onGenderChange(gender); // Informa o componente pai sobre a mudança de gênero
    setSelectedPartForColor(null);
  };

  const handleItemClick = (item: ClothingPart) => {
    const currentLookParts = currentLook.split('.').filter(part => part !== '');
    const itemType = item.type;

    let newLookParts = [...currentLookParts];
    let itemFoundAndReplaced = false;

    // Tenta encontrar as cores atuais da peça no look
    let currentColors: string[] = [];
    for (const part of currentLookParts) {
      if (part.startsWith(itemType + '-')) {
        const colorsFromPart = part.split('-').slice(2); // Pega as cores da string (ex: '61', '61')
        currentColors = colorsFromPart.filter(Boolean); // Remove strings vazias
        break;
      }
    }

    // Se o item tem colorSlots, usa a quantidade de cores necessária. Senão, tenta 1 ou 2 como padrão.
    const numberOfColorsExpected = item.colorSlots !== undefined ? item.colorSlots : (item.type === 'hr' || item.type === 'ch' || item.type === 'lg' || item.type === 'sh' || item.type === 'ha' ? 2 : 1);
    
    // Constrói as cores padrão ou mantem as atuais se existirem
    let defaultColorsForNewPart: string[] = [];
    for (let i = 0; i < numberOfColorsExpected; i++) {
        defaultColorsForNewPart.push(currentColors[i] || '7'); // Usa cor atual ou '7' (preto)
    }

    // A parte da string do look
    const newItemString = `${item.type}-${item.id}-${defaultColorsForNewPart.join('-')}`;

    for (let i = 0; i < newLookParts.length; i++) {
      if (newLookParts[i].startsWith(itemType + '-')) {
        newLookParts[i] = newItemString;
        itemFoundAndReplaced = true;
        break;
      }
    }

    if (!itemFoundAndReplaced) {
      newLookParts.push(newItemString);
    }

    const newLook = newLookParts.join('.');
    onLookChange(newLook);
    // Atualiza a peça selecionada para cor com as cores que foram realmente aplicadas
    setSelectedPartForColor({ type: item.type, id: item.id, colors: defaultColorsForNewPart });
  };

  // Lida com o clique em uma cor na paleta de cores
  const handleColorClick = (colorHex: string, colorIndex: number = 0) => {
    if (selectedPartForColor) {
      const currentLookParts = currentLook.split('.').filter(part => part !== '');
      let newLookParts = [...currentLookParts];
      let partUpdated = false;

      const { type, id, colors } = selectedPartForColor;
      const updatedColors = [...colors];
      
      // Atualiza a cor no índice especificado
      updatedColors[colorIndex] = colorHex;

      // Garante que o array de cores tem o tamanho esperado, preenchendo com '7' se necessário
      const partDefinition = clothingParts.find(p => p.type === type && p.id === id);
      const expectedColorSlots = partDefinition?.colorSlots !== undefined ? partDefinition.colorSlots : (type === 'hr' || type === 'ch' || type === 'lg' || type === 'sh' || type === 'ha' ? 2 : 1);
      
      while (updatedColors.length < expectedColorSlots) {
          updatedColors.push('7'); // Preenche com cor padrão se faltar slots
      }

      const newPartString = `${type}-${id}-${updatedColors.slice(0, expectedColorSlots).join('-')}`;

      for (let i = 0; i < newLookParts.length; i++) {
        const part = newLookParts[i];
        if (part.startsWith(`${type}-${id}-`)) {
          newLookParts[i] = newPartString;
          partUpdated = true;
          break;
        }
      }

      if (partUpdated) {
        onLookChange(newLookParts.join('.'));
        setSelectedPartForColor(prev => prev ? { ...prev, colors: updatedColors } : null);
      }
    } else {
      alert('Selecione uma peça de roupa no menu para alterar sua cor.');
    }
  };

  // Filtra os itens de roupa com base na categoria principal ativa, termo de busca e gênero
  const filteredItems = clothingParts.filter(item => {
    const matchesCategory = item.type === activeMainCategory; // Filtra pela categoria principal
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = item.gender === 'U' || item.gender === selectedGender;
    return matchesCategory && matchesSearch && matchesGender;
  });

  // Agrupa os itens filtrados por categoria de preço (HC, Vendável, etc.)
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ClothingPart[]>);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Navegação Principal (Botões de Categoria - Gênero, Cabelo, Tops, etc.) */}
      <div className="flex space-x-2 bg-gray-100 p-2 rounded mb-4 overflow-x-auto">
        {Object.keys(subNavCategories).map(type => (
          <button
            key={type}
            className={`px-4 py-2 rounded whitespace-nowrap ${activeMainCategory === type ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => handleMainCategoryClick(type)}
          >
            {subNavCategories[type]}
          </button>
        ))}
      </div>

      {/* Conteúdo Principal do Menu de Roupas */}
      <div style={{ maxHeight: '325px', maxWidth: '525px', overflowY: 'auto' }} className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <input
          type="text"
          placeholder="Buscar roupa..."
          className="mb-4 w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {activeMainCategory === 'hd' && ( // Exibir seleção de gênero apenas para 'hd' (Corpo/Rostos)
          <div className="mb-4">
            <h4 className="font-bold text-gray-800 mb-2">Selecione o Gênero:</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`px-4 py-2 rounded ${selectedGender === 'M' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleGenderSelect('M')}
              >
                Masculino
              </button>
              <button
                className={`px-4 py-2 rounded ${selectedGender === 'F' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleGenderSelect('F')}
              >
                Feminino
              </button>
            </div>
            <hr className="my-4" />
          </div>
        )}

        <div className="space-y-4">
          {Object.keys(groupedItems).length > 0 ? (
            Object.keys(groupedItems).map(category => (
              <div key={category}>
                <h4 className={`font-bold mb-2 ${
                  category === 'hc' ? 'text-yellow-600' :
                  category === 'vendavel' ? 'text-green-600' :
                  category === 'ltd' ? 'text-purple-600' :
                  category === 'raro' ? 'text-red-600' :
                  category === 'nft' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {category.toUpperCase()}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {groupedItems[category].map(item => (
                    <button
                      key={`${item.type}-${item.id}-${item.category}`}
                      className={`flex flex-col items-center justify-center p-1 border rounded hover:bg-gray-100 ${
                        selectedPartForColor?.type === item.type && selectedPartForColor?.id === item.id
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleItemClick(item)}
                      title={item.name}
                    >
                      <img
                        src={getPreviewUrl(item.type, item.id, selectedGender)}
                        alt={item.name}
                        className="w-12 h-12 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/48x48?text=Erro';
                          target.alt = 'Imagem não encontrada';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">Nenhum item encontrado nesta categoria ou com este filtro.</p>
          )}
        </div>
      </div>

      {/* Painel de Cores */}
      <div className="pincel mt-6 border border-gray-200 rounded-lg p-4">
        <h5 className="font-bold text-lg mb-2">Cores da Peça Selecionada:</h5>
        {selectedPartForColor ? (
          <div>
            <p className="text-sm mb-2 text-gray-700">
              Editando: **{clothingParts.find(p => p.type === selectedPartForColor.type && p.id === selectedPartForColor.id)?.name || 'Peça Desconhecida'}**
            </p>
            {/* Paleta de Cores Primária */}
            <div className="w-full text-sm font-medium mb-2">Cor Principal:</div>
            <div id="nonhc-primary" className="flex flex-wrap gap-1 mb-4">
              {colorPalettes.nonHc.map(color => (
                <button
                  key={`nonhc-p-${color}`}
                  className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1"
                  style={{ backgroundColor: `#${color}` }}
                  onClick={() => handleColorClick(color, 0)} // Mudar cor 1
                  title={`#${color}`}
                ></button>
              ))}
            </div>
            <div id="hc-primary" className="flex flex-wrap gap-1 mb-4">
              {colorPalettes.hc.map(color => (
                <button
                  key={`hc-p-${color}`}
                  className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1"
                  style={{ backgroundColor: `#${color}` }}
                  onClick={() => handleColorClick(color, 0)} // Mudar cor 1
                  title={`#${color}`}
                ></button>
              ))}
            </div>

            {/* Paleta de Cores Secundária (se a peça tiver mais de 1 slot de cor) */}
            {selectedPartForColor.colors.length > 1 && (
                <>
                    <div className="w-full text-sm font-medium mb-2">Cor Secundária:</div>
                    <div id="nonhc-secondary" className="flex flex-wrap gap-1 mb-4">
                    {colorPalettes.nonHc.map(color => (
                        <button
                        key={`nonhc-s-${color}`}
                        className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1"
                        style={{ backgroundColor: `#${color}` }}
                        onClick={() => handleColorClick(color, 1)} // Mudar cor 2
                        title={`#${color}`}
                        ></button>
                    ))}
                    </div>
                    <div id="hc-secondary" className="flex flex-wrap gap-1">
                    {colorPalettes.hc.map(color => (
                        <button
                        key={`hc-s-${color}`}
                        className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1"
                        style={{ backgroundColor: `#${color}` }}
                        onClick={() => handleColorClick(color, 1)} // Mudar cor 2
                        title={`#${color}`}
                        ></button>
                    ))}
                    </div>
                </>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Selecione uma peça de roupa no menu acima para alterar sua cor.</p>
        )}
      </div>
    </div>
  );
};

export default ClothingMenu;