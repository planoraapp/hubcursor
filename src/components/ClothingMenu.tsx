// src/components/ClothingMenu.tsx
import React, { useState, useEffect } from 'react';
import { clothingParts, colorPalettes, subNavCategories, ClothingPart } from '../data/clothingItems';

interface ClothingMenuProps {
  currentLook: string; // A string de look atual do avatar (ex: "hd-180-7.hr-828-45...")
  onLookChange: (newLook: string) => void; // Função para atualizar o look no componente pai (AvatarEditor)
  onGenderChange: (gender: 'M' | 'F') => void; // Função para mudar o gênero no AvatarEditor
  currentGender: 'M' | 'F'; // Gênero atual do avatar
}

const ClothingMenu: React.FC<ClothingMenuProps> = ({ currentLook, onLookChange, onGenderChange, currentGender }) => {
  const [activeMainCategory, setActiveMainCategory] = useState<string>('hd'); // Categoria principal ativa (ex: 'hd', 'hr')
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>(currentGender);
  // Mantém a peça de roupa selecionada para aplicar cor a ela
  const [selectedPartForColor, setSelectedPartForColor] = useState<{ type: string; id: number; color?: string } | null>(null);

  // Efeito para sincronizar o gênero com o componente pai
  useEffect(() => {
    setSelectedGender(currentGender);
  }, [currentGender]);

  // Função para gerar a URL da miniatura de uma peça de roupa
  const getPreviewUrl = (itemType: string, itemId: number, gender: 'M' | 'F', color: string = '7') => {
    // A URL do Habbo Imaging para partes de roupa é:
    // https://www.habbo.com/habbo-imaging/avatarimage?figure=TYPE-ID-COLOR--&gender=GENDER&size=s&headonly=0
    // O '--' é para a segunda cor de duotones, que aqui simplificamos para 7 (preto) se não especificado.
    // 'size=s' para miniaturas pequenas, 'headonly=0' para mostrar o corpo se a peça for de corpo.
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${itemType}-${itemId}-${color}--&gender=${gender}&size=s&headonly=0`;
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

  // Lida com o clique em um item de roupa/acessório na lista
  const handleItemClick = (item: ClothingPart) => {
    const currentLookParts = currentLook.split('.').filter(part => part !== '');
    const itemType = item.type; // Ex: 'hd', 'hr'

    let newLookParts = [...currentLookParts];
    let itemFoundAndReplaced = false;

    // A string de look é formada por "TYPE-ID-COLOR" para cada parte.
    // Precisamos encontrar a parte do MESMO TIPO e substituí-la.
    // Ex: Se o look atual tem "hr-123-45" e clicamos em "hr-456-78", "hr-123-45" é substituído.

    for (let i = 0; i < newLookParts.length; i++) {
      // Verifica se a parte existente começa com o mesmo TIPO (ex: 'hd-', 'hr-')
      // e também se tem o formato esperado (com hífen após o tipo para separar o ID)
      if (newLookParts[i].startsWith(itemType + '-')) {
        // Assume que a cor padrão é a cor '7' (preto) ou a primeira cor da peça, se soubermos.
        // Para simplificar, usamos '7' como cor padrão inicial para novas peças.
        const defaultColorForNewPart = '7';
        newLookParts[i] = `${item.type}-${item.id}-${defaultColorForNewPart}`; // Substitui pela nova parte e cor padrão
        itemFoundAndReplaced = true;
        break;
      }
    }

    // Se não encontrou uma parte existente do mesmo tipo, adiciona
    if (!itemFoundAndReplaced) {
      const defaultColorForNewPart = '7';
      newLookParts.push(`${item.type}-${item.id}-${defaultColorForNewPart}`);
    }

    const newLook = newLookParts.join('.');
    onLookChange(newLook); // Envia o novo look para o componente pai
    setSelectedPartForColor({ type: item.type, id: item.id, color: '7' }); // Seleciona a peça para edição de cor
  };

  // Lida com o clique em uma cor na paleta de cores
  const handleColorClick = (colorHex: string) => {
    if (selectedPartForColor) {
      const currentLookParts = currentLook.split('.').filter(part => part !== '');
      let newLookParts = [...currentLookParts];
      let partUpdated = false;

      for (let i = 0; i < newLookParts.length; i++) {
        const part = newLookParts[i];
        // Verifica se é a peça atualmente selecionada para cor
        // A string do look é TIPO-ID-COR1-COR2. Precisamos atualizar a COR1 (terceiro componente).
        if (part.startsWith(`${selectedPartForColor.type}-${selectedPartForColor.id}-`)) {
          const partsArray = part.split('-');
          // Certifica-se de que há pelo menos 3 componentes (tipo, id, cor1)
          if (partsArray.length >= 3) {
            partsArray[2] = colorHex; // Atualiza a primeira cor
            newLookParts[i] = partsArray.join('-');
            partUpdated = true;
            break;
          }
        }
      }

      if (partUpdated) {
        onLookChange(newLookParts.join('.'));
        setSelectedPartForColor(prev => prev ? { ...prev, color: colorHex } : null); // Atualiza a cor na peça selecionada
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
                      key={`${item.type}-${item.id}`} // Chave única para o item
                      className={`flex flex-col items-center justify-center p-1 border rounded hover:bg-gray-100 ${
                        selectedPartForColor?.type === item.type && selectedPartForColor?.id === item.id
                          ? 'border-blue-500 ring-2 ring-blue-500' // Destaca a peça selecionada para cor
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
                      />
                      {/* Opcional: Mostrar nome do item abaixo da miniatura */}
                      {/* <span className="text-xs text-center mt-1">{item.name}</span> */}
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
            <p className="text-sm mb-2 text-gray-700">Editando: **{clothingParts.find(p => p.type === selectedPartForColor.type && p.id === selectedPartForColor.id)?.name || 'Peça Desconhecida'}**</p>
            <div className="w-full text-sm font-medium mb-2">Cores Comuns:</div>
            <div id="nonhc" className="flex flex-wrap gap-1 mb-4">
              {colorPalettes.nonHc.map(color => (
                <button
                  key={`nonhc-${color}`}
                  className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1"
                  style={{ backgroundColor: `#${color}` }}
                  onClick={() => handleColorClick(color)}
                  title={`#${color}`}
                ></button>
              ))}
            </div>
            <div className="w-full text-sm font-medium mb-2">Cores HC:</div>
            <div id="hc" className="flex flex-wrap gap-1">
              {colorPalettes.hc.map(color => (
                <button
                  key={`hc-${color}`}
                  className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1"
                  style={{ backgroundColor: `#${color}` }}
                  onClick={() => handleColorClick(color)}
                  title={`#${color}`}
                ></button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Selecione uma peça de roupa no menu acima para alterar sua cor.</p>
        )}
      </div>
    </div>
  );
};

export default ClothingMenu;