// src/components/KihabboEditor.tsx
import React, { useState, useEffect } from 'react';
import { KIHABBO_FIGURE_PARTS, HABBO_COLOR_MAP, getHabboColorId, KihabboFigurePart, subNavCategories, colorPalettes } from '../data/kihabboFigures';

type Gender = 'M' | 'F' | 'U';

// Função para construir a URL do Habbo Imaging
const buildHabboImageUrl = (
  figure: string,
  gender: Gender,
  hotel: string = 'habbo.com.br',
  direction: number = 2,
  headDirection: number = 3,
  action: string = 'std',
  gesture: string = 'std',
  frame: number = 0,
  size: 's' | 'm' | 'l' = 'l'
) => {
  const baseUrl = `https://www.${hotel}/habbo-imaging/avatarimage?`;
  
  const params = [
    `figure=${figure}`,
    `gender=${gender}`,
    `direction=${direction}`,
    `head_direction=${headDirection}`,
    `action=${action}`,
    `gesture=${gesture}`,
    `frame=${frame}`,
    `size=${size}`,
    `headonly=0`, // Sempre mostrar o corpo completo para o avatar principal
    `img_format=png`,
  ];
  
  return `${baseUrl}${params.join('&')}`;
};

const KihabboEditor: React.FC = () => {
  const [hotel, setHotel] = useState('habbo.com.br');
  const [username, setUsername] = useState('HabboHotel');
  const [currentGender, setCurrentGender] = useState<Gender>('M'); // Padrão do Kihabbo é M
  const [currentLook, setCurrentLook] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('hd'); // Categoria de roupa ativa
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartForColor, setSelectedPartForColor] = useState<{ item: KihabboFigurePart; currentColors: string[] } | null>(null);

  const [direction, setDirection] = useState(2);
  const [headDirection, setHeadDirection] = useState(3);

  // Looks padrão usando IDs numéricos de cor mapeados do HABBO_COLOR_MAP
  const defaultMaleLook = `hd-180-${getHabboColorId('F5DA88')}-.hr-678-${getHabboColorId('000000')}-${getHabboColorId('828282')}-.ch-3006-${getHabboColorId('000000')}-${getHabboColorId('828282')}-.lg-275-${getHabboColorId('000000')}-.sh-3059-${getHabboColorId('000000')}-`;
  // Look feminino com IDs e catalogNames validados:
  const defaultFemaleLook = `hd-600-${getHabboColorId('F5DA88')}-.hr-5773-${getHabboColorId('000000')}-${getHabboColorId('828282')}-.ch-800-${getHabboColorId('000000')}-.lg-900-${getHabboColorId('000000')}-.sh-100-${getHabboColorId('000000')}-`;

  useEffect(() => {
    if (currentGender === 'M') {
      setCurrentLook(defaultMaleLook);
    } else {
      setCurrentLook(defaultFemaleLook);
    }
  }, [currentGender]);

  useEffect(() => {
    const newUrl = buildHabboImageUrl(
      currentLook, currentGender, hotel, direction, headDirection, 'std', 'std', 0, 'l'
    );
    setAvatarUrl(newUrl);
    console.log('NOVA URL FINAL DO AVATAR:', newUrl);
  }, [currentLook, currentGender, hotel, direction, headDirection]);

  const handleHotelChange = (e: React.ChangeEvent<HTMLSelectElement>) => setHotel(e.target.value);
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);

  const rotateHead = (dir: 'left' | 'right') => {
    setHeadDirection(prev => (dir === 'left' ? (prev === 0 ? 7 : prev - 1) : (prev === 7 ? 0 : prev + 1)));
  };
  const rotateBody = (dir: 'left' | 'right') => {
    setDirection(prev => (dir === 'left' ? (prev === 0 ? 7 : prev - 1) : (prev === 7 ? 0 : prev + 1)));
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(avatarUrl);
      alert('URL copiada para a área de transferência!');
    } catch (err) {
      console.error('Falha ao copiar: ', err);
      alert('Erro ao copiar a URL. Por favor, copie manualmente.');
    }
  };

  // Função para gerar a URL da miniatura de uma peça de roupa
  const getPreviewUrl = (item: KihabboFigurePart) => {
    if (item.catalogName) {
      return `https://api.habboapi.net/furni/${item.catalogName}/icon`;
    }
    // Fallback: usar Habbo Imaging com ID de cor padrão e formato de traços correto
    const fallbackColorId = getHabboColorId('000000'); // ID para preto
    let colorsPart = '';
    for (let i = 0; i < item.colorSlots; i++) {
        colorsPart += `${fallbackColorId}` + (i < item.colorSlots - 1 ? '-' : '');
    }
    if (item.colorSlots > 0) colorsPart += '-'; // Adiciona traço final

    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.type}-${item.id}-${colorsPart}&gender=${currentGender}&size=s&headonly=0`;
  };

  const handleItemClick = (item: KihabboFigurePart) => {
    const currentParts = currentLook.split('.').filter(Boolean);
    let newParts: string[] = [];
    let updated = false;

    const defaultColorId = getHabboColorId('000000'); // ID para preto

    let colorsToApply: string[] = Array(item.colorSlots).fill(defaultColorId);

    const existingPart = currentParts.find(p => p.startsWith(item.type + '-'));
    if (existingPart) {
        const existingColors = existingPart.split('-').slice(2).filter(Boolean);
        for(let i = 0; i < item.colorSlots; i++) {
            colorsToApply[i] = existingColors[i] || defaultColorId;
        }
    }

    let itemFigureString = `${item.type}-${item.id}`;
    if (item.colorSlots > 0) {
        itemFigureString += `-${colorsToApply.join('-')}`;
        itemFigureString += '-'; // Adiciona traço final
    }

    for (const part of currentParts) {
        if (part.startsWith(item.type + '-')) {
            newParts.push(itemFigureString);
            updated = true;
        } else {
            newParts.push(part);
        }
    }
    if (!updated) {
        newParts.push(itemFigureString);
    }
    
    const newLook = newParts.join('.');
    setCurrentLook(newLook);
    setSelectedPartForColor({ item: item, currentColors: colorsToApply });

    console.log(`Item selecionado: ${item.name}. Novo look: ${newLook}`);
  };

  const handleColorClick = (colorHex: string, colorIndex: number) => {
    if (!selectedPartForColor) {
      alert('Selecione uma peça de roupa primeiro para alterar a cor.');
      return;
    }

    const { item, currentColors } = selectedPartForColor;
    const newColors = [...currentColors];
    newColors[colorIndex] = getHabboColorId(colorHex);

    while (newColors.length < item.colorSlots) {
      newColors.push(getHabboColorId('000000'));
    }

    let newPartString = `${item.type}-${item.id}`;
    if (item.colorSlots > 0) {
        newPartString += `-${newColors.slice(0, item.colorSlots).join('-')}`;
        newPartString += '-'; // Adiciona traço final
    }

    const currentParts = currentLook.split('.').filter(Boolean);
    const updatedParts = currentParts.map(part => 
        part.startsWith(`${item.type}-${item.id}-`) ? newPartString : part
    );

    const newLook = updatedParts.join('.');
    setCurrentLook(newLook);
    setSelectedPartForColor({ item: item, currentColors: newColors });

    console.log(`Cor alterada para: ${colorHex}. Novo look: ${newLook}`);
  };

  // Filtra as roupas para exibição no menu
  const filteredItems = KIHABBO_FIGURE_PARTS.filter(item => {
    const matchesCategory = item.type === activeCategory;
    const matchesSearch = searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesGender = item.gender === 'U' || item.gender === currentGender;
    return matchesCategory && matchesSearch && matchesGender;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, KihabboFigurePart[]>);

  return (
    <main className="flex flex-col sm:flex-row h-full justify-evenly select-none">
      {/* Coluna Esquerda: Avatar e Controles */}
      <div className="w-full sm:w-3/12 max-h-[32rem] h-[32rem] bg-gray-50 mt-0 sm:mb-8">
        <h1 className="font-sans text-slate-600 font-bold w-full bg-gray-200 p-2 shadow-inner mr-2 text-center">Avatar Generation</h1>
        <div className="flex flex-col h-full">
          <div id="avatar-container" className="flex flex-row items-center">
            {/* Botões de rotação Esquerda */}
            <div className="w-1/3 h-full flex flex-col justify-center items-center gap-[2rem]">
              <div id="head-left" onClick={() => rotateHead('left')} className="cursor-pointer">
                <img decoding="async" className="mx-auto object-fill" src="https://habbodefense.com/wp-content/uploads/2024/03/sticker_arrow_left.png" alt="Rotate Head Left" />
              </div>
              <div id="body-left" onClick={() => rotateBody('left')} className="cursor-pointer">
                <img decoding="async" className="mx-auto object-contain" src="https://habbodefense.com/wp-content/uploads/2024/03/sticker_arrow_left.png" alt="Rotate Body Left" />
              </div>
            </div>
            {/* Avatar Principal */}
            <div className="w-1/3 object-center relative">
              <img decoding="async" id="myHabbo" className="mx-auto" src={avatarUrl} alt="My Habbo" style={{ imageRendering: 'pixelated' }} />
              <div className="puff-ready hidden"></div>
            </div>
            {/* Botões de rotação Direita */}
            <div className="w-1/3 h-full flex flex-col justify-center items-center gap-[2rem]">
              <div id="head-right" onClick={() => rotateHead('right')} className="cursor-pointer">
                <img decoding="async" className="mx-auto" src="https://habbodefense.com/wp-content/uploads/2024/03/sticker_arrow_right.png" alt="Rotate Head Right" />
              </div>
              <div id="body-right" onClick={() => rotateBody('right')} className="cursor-pointer">
                <img decoding="async" className="mx-auto" src="https://habbodefense.com/wp-content/uploads/2024/03/sticker_arrow_right.png" alt="Rotate Body Right" />
              </div>
            </div>
          </div>

          {/* Utilities Container (Randomise, Copy URL, User Search) */}
          <div id="utilities-container" className="flex flex-col justify-evenly bg-gray-100 p-2 pb-4 gap-2 shadow-inner">
            <a id="random" className="habbo-button p-2 m-1 shadow-lg hover:shadow-inner cursor-pointer text-ellipsis overflow-hidden text-slate-900 hover:text-slate-900">Randomise</a>
            <div className="flex">
              <a id="copy-url" className="habbo-button p-2 m-1 w-[50%] shadow-lg hover:shadow-inner cursor-pointer text-ellipsis overflow-hidden text-slate-900 hover:text-slate-900" onClick={handleCopyUrl}>Copy Full Avatar URL</a>
              <a id="copy-face-url" className="habbo-button p-2 m-1 w-[50%] shadow-lg hover:shadow-inner cursor-pointer text-ellipsis overflow-hidden text-slate-900 hover:text-slate-900">Copy Face Only URL</a>
            </div>
            
            {/* Region Selector (Hotel) - Adaptado para select padrão */}
            <div id="regions-container" className="flex flex-col w-full">
              <h2 className="font-sans text-slate-600 font-bold p-2 text-center">Region Selector</h2>
              <div id="regions-subcontainer" className="bg-gray-100 mx-2 shadow-inner relative rounded">
                <select
                  className="w-full p-2 border rounded-lg bg-white appearance-none cursor-pointer"
                  value={hotel}
                  onChange={handleHotelChange}
                >
                  <option value="habbo.com.br">Habbo.com.br (Brasil/Portugal)</option>
                  <option value="habbo.com">Habbo.com (Internacional)</option>
                  <option value="habbo.de">Habbo.de (Alemanha)</option>
                  <option value="habbo.es">Habbo.es (Espanha)</option>
                  <option value="habbo.fi">Habbo.fi (Finlândia)</option>
                  <option value="habbo.fr">Habbo.fr (França)</option>
                  <option value="habbo.it">Habbo.it (Itália)</option>
                  <option value="habbo.nl">Habbo.nl (Holanda)</option>
                  <option value="habbo.com.tr">Habbo.com.tr (Turquia)</option>
                </select>
              </div>
            </div>

            {/* User Search */}
            <div id="username-container" className="flex flex-col">
              <h2 className="font-sans text-slate-600 font-bold p-2 text-center">User Search</h2>
              <div className="bg-gray-100 p-2 mx-2 shadow-inner rounded">
                <input
                  type="text"
                  id="user-search"
                  className="w-full placeholder-gray-400 p-2 rounded-lg shadow-inner border outline-none text-black"
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outfit Selector e Color Selector */}
      <div id="outfit-selector" className="w-full sm:w-5/12 max-h-[32rem] h-[32rem] bg-gray-50 mt-0 sm:mb-8 sm:block">
        <div id="outfit-navigation" className="flex flex-row h-[2.5rem] shadow-inner bg-gray-200">
          {/* Botões de categoria principal */}
          {Object.keys(subNavCategories).slice(0, 8).map(type => (
            <a
              key={type}
              id={type} // Usar o 'type' como ID para consistência
              className={`w-1/4 p-2 cursor-pointer hover:bg-gray-100 ${activeCategory === type ? 'bg-gray-100 shadow-inner' : ''}`}
              onClick={() => setActiveCategory(type)}
            >
              <img 
                decoding="async" 
                className="m-auto" 
                src={`https://habbodefense.com/wp-content/uploads/2024/03/${type}.png`} 
                alt={subNavCategories[type]}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/24x24?text=?';
                }}
              />
            </a>
          ))}
        </div>

        <div className="h-[0.5rem] bg-gray-100"></div>

        {/* Sub-navegação para o gênero (exibido quando 'hd' é a categoria principal para seleção de gênero) */}
        {activeCategory === 'hd' && (
          <div id="body-subnavigation" className="flex flex-row h-[2.5rem] shadow-inner bg-gray-200 justify-evenly">
            <a 
              id="male-gender" 
              data-gender="M" 
              className={`w-full cursor-pointer hover:bg-gray-100 ${currentGender === 'M' ? 'bg-gray-100 shadow-md' : ''}`} 
              onClick={() => setCurrentGender('M')}
            >
              <img decoding="async" className="m-auto" src="https://habbodefense.com/wp-content/uploads/2024/03/male.png" alt="Male" />
            </a>
            <a 
              id="female-gender" 
              data-gender="F" 
              className={`w-full cursor-pointer hover:bg-gray-100 ${currentGender === 'F' ? 'bg-gray-100 shadow-md' : ''}`} 
              onClick={() => setCurrentGender('F')}
            >
              <img decoding="async" className="m-auto" src="https://habbodefense.com/wp-content/uploads/2024/03/female.png" alt="Female" />
            </a>
          </div>
        )}
        
        {/* Outfit Picker / Item List */}
        <div id="subnavigation-content" className="flex flex-wrap justify-center max-h-[26.5rem] overflow-y-auto">
            {Object.keys(groupedItems).length > 0 ? (
                Object.keys(groupedItems).map(category => (
                    <div key={category} className="w-full">
                        <h4 className={`font-bold mb-2 p-2 ${
                            category === 'hc' ? 'text-yellow-600' :
                            category === 'sellable' ? 'text-green-600' :
                            category === 'ltd' ? 'text-purple-600' :
                            category === 'rare' ? 'text-red-600' :
                            category === 'nft' ? 'text-blue-600' :
                            'text-gray-600'
                        }`}>
                            {category.toUpperCase()}
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                            {groupedItems[category].map(item => (
                                <button
                                    key={`${item.type}-${item.id}-${item.category}`}
                                    className={`relative rounded-full m-2 w-14 h-14 bg-gray-200 cursor-pointer hover:shadow-inner hover:!bg-gray-500 ${
                                        selectedPartForColor?.item.type === item.type && selectedPartForColor?.item.id === item.id
                                        ? 'border-blue-500 ring-2 ring-blue-500'
                                        : ''
                                    }`}
                                    onClick={() => handleItemClick(item)}
                                    title={item.name}
                                >
                                    {/* Ícone de categoria (HC, NFT, etc.) */}
                                    {(item.category === 'hc' || item.category === 'nft') && (
                                        <img
                                            decoding="async"
                                            className="absolute z-10 top-0 left-0 h-4 w-4"
                                            src={`https://habbodefense.com/wp-content/uploads/2024/03/${item.category}_icon.png`}
                                            alt={`${item.category} icon`}
                                        />
                                    )}
                                    {/* Imagem da miniatura do item */}
                                    <div className="absolute rounded-full z-0 w-14 h-14 overflow-hidden">
                                        <img
                                            decoding="async"
                                            style={{ transform: 'translateY(-5px)' }}
                                            loading="lazy"
                                            src={getPreviewUrl(item)}
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = 'https://via.placeholder.com/48x48?text=X';
                                                target.alt = 'Erro';
                                            }}
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-center p-4">Nenhum item encontrado nesta categoria ou com este filtro.</p>
            )}
        </div>
      </div>

      {/* Color Selector */}
      <div id="color-selector" className="w-full sm:w-3/12 max-h-[32rem] h-[32rem] bg-gray-50 mt-0 sm:mb-8 sm:block">
        <h1 className="font-sans text-slate-600 font-bold w-full h-[2.5rem] bg-gray-200 p-2 shadow-inner text-center">Color Selector</h1>
        <div className="flex flex-col h-[29rem]">
          {selectedPartForColor ? (
            <div id="color-palettes-content" className="p-2">
              <p className="text-sm mb-2 text-gray-700">Editando: **{selectedPartForColor.item.name}**</p>
              {Array.from({ length: selectedPartForColor.item.colorSlots }).map((_, colorIndex) => (
                <div key={colorIndex}>
                  <h2 className="font-sans text-slate-600 font-bold p-2 h-[2.5rem] bg-gray-100 rounded-lg m-2 shadow-inner text-center">
                    Cor {colorIndex === 0 ? 'Principal' : colorIndex === 1 ? 'Secundária' : 'Terciária'}
                  </h2>
                  <div id={`color-slot-${colorIndex}`} className="relative flex flex-wrap bg-gray-100 h-auto rounded-lg m-2 overflow-y-auto justify-center p-2">
                    {colorPalettes.nonHc.map(color => (
                      <button
                        key={`nonhc-${colorIndex}-${color}`}
                        className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1 m-0.5"
                        style={{ backgroundColor: `#${color}` }}
                        onClick={() => handleColorClick(color, colorIndex)}
                        title={`#${color}`}
                      ></button>
                    ))}
                    {colorPalettes.hc.map(color => (
                      <button
                        key={`hc-${colorIndex}-${color}`}
                        className="w-6 h-6 border rounded-full focus:ring-2 ring-blue-500 ring-offset-1 m-0.5"
                        style={{ backgroundColor: `#${color}` }}
                        onClick={() => handleColorClick(color, colorIndex)}
                        title={`#${color}`}
                      ></button>
                    ))}
                  </div>
                </div>
            ))}
             {selectedPartForColor.item.colorSlots === 0 && (
                <p className="text-gray-500 text-sm p-2">Esta peça não possui opções de cor.</p>
             )}
          </div>
        ) : (
          <div className="p-2">
            <p className="text-gray-500 text-sm">Selecione uma peça de roupa no menu para alterar sua cor.</p>
          </div>
        )}
        </div>
      </div>
    </main>
  );
};

export default KihabboEditor;