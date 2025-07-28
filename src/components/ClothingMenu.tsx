// src/components/ClothingMenu.tsx
import React, { useState, useEffect } from 'react';
import { clothingParts, colorPalettes, subNavCategories, ClothingPart, getHabboColorId } from '../data/clothingItems';

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
  const [selectedPartForColor, setSelectedPartForColor] = useState<{ item: ClothingPart; currentColors: string[] } | null>(null);

  useEffect(() => {
    setSelectedGender(currentGender);
  }, [currentGender]);

  // Função para gerar a URL da miniatura de uma peça de roupa
  // Prioriza habboapi.net se catalogName existir, senão usa Habbo Imaging
  const getPreviewUrl = (item: ClothingPart) => {
    if (item.catalogName) {
      return `https://api.habboapi.net/furni/${item.catalogName}/icon`;
    }
    // Fallback para Habbo Imaging (melhorado com IDs numéricos e traços extras)
    const previewColor = getHabboColorId('000000'); // ID para preto
    let colorsPart = '';
    if (item.colorSlots >= 1) colorsPart = `${previewColor}`;
    if (item.colorSlots >= 2) colorsPart += `-${previewColor}`;
    if (item.colorSlots >= 3) colorsPart += `-${previewColor}`;
    
    const finalColorsString = colorsPart ? `${colorsPart}-` : ''; // Adiciona traço final

    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.type}-${item.id}-${finalColorsString}&gender=${currentGender}&size=s&headonly=0`;
  };


  const handleMainCategoryClick = (type: string) => {
    setActiveMainCategory(type);
    setSearchTerm('');
    setSelectedPartForColor(null);
  };

  const handleGenderSelect = (gender: 'M' | 'F') => {
    setSelectedGender(gender);
    onGenderChange(gender);
    setSelectedPartForColor(null);
  };

  const handleItemClick = (item: ClothingPart) => {
    const currentLookParts = currentLook.split('.').filter(part => part !== '');
    const itemType = item.type;

    let newLookParts = [...currentLookParts];
    let itemFoundAndReplaced = false;

    const numberOfColorsExpected = item.colorSlots !== undefined ? item.colorSlots : 1;

    let colorsToApply: string[] = [];
    const existingPart = currentLookParts.find(part => part.startsWith(itemType + '-'));
    if (existingPart) {
      const existingColors = existingPart.split('-').slice(2).filter(Boolean);
      for (let i = 0; i < numberOfColorsExpected; i++) {
        colorsToApply.push(existingColors[i] || getHabboColorId('000000'));
      }
    } else {
      colorsToApply = Array(numberOfColorsExpected).fill(getHabboColorId('000000'));
    }

    // Constrói a string de cores para a URL do figure.
    // Ex: "61-63", "1", ou vazio se colorSlots=0
    const colorsString = numberOfColorsExpected > 0 ? colorsToApply.join('-') : '';

    // Constrói a parte completa do item para a string do look
    let finalItemString = `${item.type}-${item.id}`;
    if (numberOfColorsExpected > 0) {
        finalItemString += `-${colorsString}`;
        // Adiciona um traço final para consistência, se houver cores.
        // A API Habbo Imaging espera um traço final mesmo que não haja mais cores.
        finalItemString += '-';
    }
    
    // Log para depuração
    console.log(`Clicou em: ${item.name} (${item.type}-${item.id}). Cores aplicadas: ${colorsToApply.join(',')} (${numberOfColorsExpected} slots)`);
    console.log('String final para look:', finalItemString);

    for (let i = 0; i < newLookParts.length; i++) {
      if (newLookParts[i].startsWith(itemType + '-')) {
        newLookParts[i] = finalItemString;
        itemFoundAndReplaced = true;
        break;
      }
    }

    if (!itemFoundAndReplaced) {
      newLookParts.push(finalItemString);
    }

    const newLook = newLookParts.join('.');
    onLookChange(newLook);
    setSelectedPartForColor({ item: item, currentColors: colorsToApply });
  };


  const handleColorClick = (colorHex: string, colorIndex: number) => {
    if (selectedPartForColor) {
      const { item, currentColors } = selectedPartForColor;
      const newColors = [...currentColors];
      
      const habboColorId = getHabboColorId(colorHex);
      newColors[colorIndex] = habboColorId;

      // Garante que o array de cores tenha o tamanho correto
      const numberOfColorsExpected = item.colorSlots !== undefined ? item.colorSlots : 1;
      while (newColors.length < numberOfColorsExpected) {
          newColors.push(getHabboColorId('000000')); // Preenche com cor padrão
      }

      const colorsString = newColors.slice(0, numberOfColorsExpected).join('-');
      let newPartString = `${item.type}-${item.id}`;
      if (numberOfColorsExpected > 0) {
          newPartString += `-${colorsString}`;
          newPartString += '-'; // Adiciona traço final
      }

      const currentLookParts = currentLook.split('.').filter(part => part !== '');
      const updatedLookParts = currentLookParts.map(part => {
        if (part.startsWith(`${item.type}-${item.id}-`)) {
          return newPartString;
        }
        return part;
      });

      onLookChange(updatedLookParts.join('.'));
      setSelectedPartForColor({ item: item, currentColors: newColors });
    } else {
      alert('Selecione uma peça de roupa no menu para alterar sua cor.');
    }
  };


  const filteredItems = clothingParts.filter(item => {
    const matchesCategory = item.type === activeMainCategory;
    const matchesSearch = searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesGender = item.gender === 'U' || item.gender === selectedGender;
    return matchesCategory && matchesSearch && matchesGender;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ClothingPart[]>);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
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

      <div style={{ maxHeight: '325px', maxWidth: '525px', overflowY: 'auto' }} className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <input
          type="text"
          placeholder="Buscar roupa..."
          className="mb-4 w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {activeMainCategory === 'hd' && (
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
                        selectedPartForColor?.item.type === item.type && selectedPartForColor?.item.id === item.id
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleItemClick(item)}
                      title={item.name}
                    >
                      <img
                        src={getPreviewUrl(item)} // Sem o gender aqui, pois a API habboapi.net não precisa
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
              Editando: **{selectedPartForColor.item.name}**
            </p>
            {Array.from({ length: selectedPartForColor.item.colorSlots }).map((_, colorIndex) => (
              <div key={colorIndex}>
                <div className="w-full text-sm font-medium mb-2">
                  Cor {colorIndex === 0 ? 'Principal' : colorIndex === 1 ? 'Secundária' : 'Terciária'}:
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {colorPalettes.nonHc.map(color => (
                    <button
                      key={`nonhc-${colorIndex}-${color}`}
                      className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1"
                      style={{ backgroundColor: `#${color}` }}
                      onClick={() => handleColorClick(color, colorIndex)}
                      title={`#${color}`}
                    ></button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {colorPalettes.hc.map(color => (
                    <button
                      key={`hc-${colorIndex}-${color}`}
                      className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1"
                      style={{ backgroundColor: `#${color}` }}
                      onClick={() => handleColorClick(color, colorIndex)}
                      title={`#${color}`}
                    ></button>
                  ))}
                </div>
              </div>
            ))}
             {selectedPartForColor.item.colorSlots === 0 && (
                <p className="text-gray-500 text-sm">Esta peça não possui opções de cor.</p>
             )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Selecione uma peça de roupa no menu para alterar sua cor.</p>
        )}
      </div>
    </div>
  );
};

export default ClothingMenu;