// src/components/HabboHubEditor.tsx
import React, { useState, useEffect } from 'react';
import { HABBO_FIGURE_PARTS, HABBO_COLOR_MAP, getHabboColorId, HabboFigurePart, subNavCategories, colorPalettes } from '../data/habboFigures';

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
    `headonly=0`,
    `img_format=png`,
  ];
  
  return `${baseUrl}${params.join('&')}`;
};

const HabboHubEditor: React.FC = () => {
  const [hotel, setHotel] = useState('habbo.com.br');
  const [username, setUsername] = useState('HabboHub');
  const [currentGender, setCurrentGender] = useState<Gender>('M');
  const [currentLook, setCurrentLook] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('hd');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartForColor, setSelectedPartForColor] = useState<{ item: HabboFigurePart; currentColors: string[] } | null>(null);

  const [direction, setDirection] = useState(2);
  const [headDirection, setHeadDirection] = useState(3);

  // Looks padrão usando IDs numéricos de cor mapeados do HABBO_COLOR_MAP
  const defaultMaleLook = `hd-180-${getHabboColorId('F5DA88')}-.hr-678-${getHabboColorId('000000')}-${getHabboColorId('828282')}-.ch-3006-${getHabboColorId('000000')}-${getHabboColorId('828282')}-.lg-275-${getHabboColorId('000000')}-.sh-3059-${getHabboColorId('000000')}-`;
  const defaultFemaleLook = `hd-600-${getHabboColorId('F5DA88')}-.hr-5773-${getHabboColorId('000000')}-${getHabboColorId('828282')}-.ch-800-${getHabboColorId('000000')}-.lg-900-${getHabboColorId('000000')}-.sh-100-${getHabboColorId('000000')}-`;

  useEffect(() => {
    if (currentGender === 'M') {
      setCurrentLook(defaultMaleLook);
    } else {
      setCurrentLook(defaultFemaleLook);
    }
  }, [currentGender, defaultMaleLook, defaultFemaleLook]);

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

  const getPreviewUrl = (item: HabboFigurePart) => {
    if (item.catalogName) {
      return `https://api.habboapi.net/furni/${item.catalogName}/icon`;
    }
    const fallbackColorId = getHabboColorId('000000');
    let colorsPart = '';
    for (let i = 0; i < item.colorSlots; i++) {
        colorsPart += `${fallbackColorId}` + (i < item.colorSlots - 1 ? '-' : '');
    }
    if (item.colorSlots > 0) colorsPart += '-';

    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.type}-${item.id}-${colorsPart}&gender=${currentGender}&size=s&headonly=0`;
  };

  const handleItemClick = (item: HabboFigurePart) => {
    const currentParts = currentLook.split('.').filter(Boolean);
    let newParts: string[] = [];
    let updated = false;

    const defaultColorId = getHabboColorId('000000');

    let colorsForThisItem: string[] = Array(item.colorSlots).fill(defaultColorId);

    const existingPart = currentParts.find(p => p.startsWith(item.type + '-'));
    if (existingPart) {
        const existingColors = existingPart.split('-').slice(2).filter(Boolean);
        for(let i = 0; i < item.colorSlots; i++) {
            colorsForThisItem[i] = existingColors[i] || defaultColorId;
        }
    }

    let itemFigureString = `${item.type}-${item.id}`;
    if (item.colorSlots > 0) {
        itemFigureString += `-${colorsForThisItem.join('-')}`;
        itemFigureString += '-';
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
    setSelectedPartForColor({ item: item, currentColors: colorsForThisItem });

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
        newPartString += '-';
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

  const filteredItems = HABBO_FIGURE_PARTS.filter(item => {
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
  }, {} as Record<string, HabboFigurePart[]>);

  const categoryImages = {
    hd: 'body.png',
    hr: 'hair.png',
    ch: 'tops.png',
    lg: 'bottoms.png',
    sh: 'shoes.png',
    ha: 'hats.png',
    he: 'hair.png',
    ea: 'eyes.png',
    fa: 'face.png',
    cp: 'chest.png',
    cc: 'coats.png',
    wa: 'waist.png',
    ca: 'back.png',
    ct: 'tops.png',
  };

  const mainCategories = ['hd', 'hr', 'ch', 'lg', 'sh', 'ha', 'ea', 'fa'];

  return (
    <main className="flex flex-col lg:flex-row h-full justify-evenly select-none gap-4 p-4">
      {/* Coluna Esquerda: Avatar e Controles */}
      <div className="w-full lg:w-3/12 max-h-[32rem] h-[32rem] bg-gray-50 order-2 lg:order-1">
        <h1 className="font-sans text-slate-600 font-bold w-full bg-gray-200 p-2 shadow-inner text-center">Geração de Avatar HabboHub</h1>
        <div className="flex flex-col h-full">
          <div id="avatar-container" className="flex flex-row items-center justify-center p-4">
            <div className="w-1/4 h-full flex flex-col justify-center items-center gap-8">
              <div onClick={() => rotateHead('left')} className="cursor-pointer">
                <img decoding="async" className="mx-auto w-6 h-6" src="https://habbodefense.com/wp-content/uploads/2024/03/sticker_arrow_left.png" alt="Girar Cabeça Esquerda" />
              </div>
              <div onClick={() => rotateBody('left')} className="cursor-pointer">
                <img decoding="async" className="mx-auto w-6 h-6" src="https://habbodefense.com/wp-content/uploads/2024/03/sticker_arrow_left.png" alt="Girar Corpo Esquerda" />
              </div>
            </div>
            <div className="w-1/2 object-center relative">
              <img decoding="async" id="myHabbo" className="mx-auto max-w-full h-auto" src={avatarUrl} alt="Meu Habbo" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="w-1/4 h-full flex flex-col justify-center items-center gap-8">
              <div onClick={() => rotateHead('right')} className="cursor-pointer">
                <img decoding="async" className="mx-auto w-6 h-6" src="https://habbodefense.com/wp-content/uploads/2024/03/sticker_arrow_right.png" alt="Girar Cabeça Direita" />
              </div>
              <div onClick={() => rotateBody('right')} className="cursor-pointer">
                <img decoding="async" className="mx-auto w-6 h-6" src="https://habbodefense.com/wp-content/uploads/2024/03/sticker_arrow_right.png" alt="Girar Corpo Direita" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-evenly bg-gray-100 p-2 gap-2 shadow-inner">
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 m-1 rounded cursor-pointer">Aleatorizar</button>
            <div className="flex gap-1">
              <button onClick={handleCopyUrl} className="bg-green-500 hover:bg-green-600 text-white p-2 flex-1 rounded text-sm">Copiar URL Completa</button>
              <button className="bg-green-500 hover:bg-green-600 text-white p-2 flex-1 rounded text-sm">Copiar URL Rosto</button>
            </div>
            
            <div className="flex flex-col w-full">
              <h2 className="font-sans text-slate-600 font-bold p-2 text-center text-sm">Seletor de Região</h2>
              <select
                className="w-full p-2 border rounded-lg bg-white text-sm"
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

            <div className="flex flex-col">
              <h2 className="font-sans text-slate-600 font-bold p-2 text-center text-sm">Buscar Usuário</h2>
              <input
                type="text"
                className="w-full placeholder-gray-400 p-2 rounded-lg border outline-none text-black text-sm"
                placeholder="Nome de Usuário"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Central: Seletor de Roupas */}
      <div className="w-full lg:w-5/12 max-h-[32rem] h-[32rem] bg-gray-50 order-1 lg:order-2">
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-8 h-[2.5rem] shadow-inner bg-gray-200">
          {mainCategories.map(type => (
            <button
              key={type}
              className={`p-1 cursor-pointer hover:bg-gray-100 flex items-center justify-center ${activeCategory === type ? 'bg-gray-100 shadow-inner' : ''}`}
              onClick={() => setActiveCategory(type)}
            >
              <img 
                decoding="async" 
                className="w-4 h-4 sm:w-6 sm:h-6" 
                src={`https://habbodefense.com/wp-content/uploads/2024/03/${categoryImages[type as keyof typeof categoryImages] || 'body.png'}`} 
                alt={subNavCategories[type]}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/24x24?text=?';
                }}
              />
            </button>
          ))}
        </div>

        <div className="h-[0.5rem] bg-gray-100"></div>

        {/* Sub-navegação para o gênero */}
        {activeCategory === 'hd' && (
          <div className="flex flex-row h-[2.5rem] shadow-inner bg-gray-200 justify-evenly">
            <button 
              className={`w-full cursor-pointer hover:bg-gray-100 flex items-center justify-center ${currentGender === 'M' ? 'bg-gray-100 shadow-md' : ''}`} 
              onClick={() => setCurrentGender('M')}
            >
              <img decoding="async" className="w-6 h-6" src="https://habbodefense.com/wp-content/uploads/2024/03/male.png" alt="Masculino" />
            </button>
            <button 
              className={`w-full cursor-pointer hover:bg-gray-100 flex items-center justify-center ${currentGender === 'F' ? 'bg-gray-100 shadow-md' : ''}`} 
              onClick={() => setCurrentGender('F')}
            >
              <img decoding="async" className="w-6 h-6" src="https://habbodefense.com/wp-content/uploads/2024/03/female.png" alt="Feminino" />
            </button>
          </div>
        )}
        
        {/* Lista de Itens */}
        <div className="flex flex-wrap justify-center max-h-[26.5rem] overflow-y-auto p-2">
            {Object.keys(groupedItems).length > 0 ? (
                Object.keys(groupedItems).map(category => (
                    <div key={category} className="w-full">
                        <h4 className={`font-bold mb-2 p-2 text-sm ${
                            category === 'hc' ? 'text-yellow-600' :
                            category === 'sellable' ? 'text-green-600' :
                            category === 'ltd' ? 'text-purple-600' :
                            category === 'rare' ? 'text-red-600' :
                            category === 'nft' ? 'text-blue-600' :
                            'text-gray-600'
                        }`}>
                            {category.toUpperCase()}
                        </h4>
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
                            {groupedItems[category].map(item => (
                                <button
                                    key={`${item.type}-${item.id}-${item.category}`}
                                    className={`relative rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 cursor-pointer hover:shadow-inner hover:bg-gray-300 ${
                                        selectedPartForColor?.item.type === item.type && selectedPartForColor?.item.id === item.id
                                        ? 'border-blue-500 ring-2 ring-blue-500'
                                        : ''
                                    }`}
                                    onClick={() => handleItemClick(item)}
                                    title={item.name}
                                >
                                    {(item.category === 'hc' || item.category === 'nft') && (
                                        <img
                                            decoding="async"
                                            className="absolute z-10 top-0 left-0 h-3 w-3 sm:h-4 sm:w-4"
                                            src={`https://habbodefense.com/wp-content/uploads/2024/03/${item.category}_icon.png`}
                                            alt={`${item.category} icon`}
                                        />
                                    )}
                                    <div className="absolute rounded-full z-0 w-full h-full overflow-hidden">
                                        <img
                                            decoding="async"
                                            style={{ transform: 'translateY(-2px)' }}
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
                <p className="text-gray-500 text-center p-4 text-sm">Nenhum item encontrado nesta categoria.</p>
            )}
        </div>
      </div>

      {/* Coluna Direita: Seletor de Cores */}
      <div className="w-full lg:w-3/12 max-h-[32rem] h-[32rem] bg-gray-50 order-3">
        <h1 className="font-sans text-slate-600 font-bold w-full h-[2.5rem] bg-gray-200 p-2 shadow-inner text-center">Seletor de Cores</h1>
        <div className="flex flex-col h-[29rem] overflow-y-auto">
          {selectedPartForColor ? (
            <div className="p-2">
              <p className="text-sm mb-2 text-gray-700">Editando: <strong>{selectedPartForColor.item.name}</strong></p>
              {Array.from({ length: selectedPartForColor.item.colorSlots }).map((_, colorIndex) => (
                <div key={colorIndex} className="mb-4">
                  <h2 className="font-sans text-slate-600 font-bold p-2 h-[2rem] bg-gray-100 rounded-lg mb-2 shadow-inner text-center text-sm">
                    Cor {colorIndex === 0 ? 'Principal' : colorIndex === 1 ? 'Secundária' : 'Terciária'}
                  </h2>
                  <div className="flex flex-wrap bg-gray-100 rounded-lg p-2 justify-center gap-1">
                    {colorPalettes.nonHc.map(color => (
                        <button
                            key={`nonhc-${colorIndex}-${color}`}
                            className="w-5 h-5 sm:w-6 sm:h-6 border rounded-full hover:scale-110 transition-transform"
                            style={{ backgroundColor: `#${color}` }}
                            onClick={() => handleColorClick(color, colorIndex)}
                            title={`#${color}`}
                        ></button>
                    ))}
                    {colorPalettes.hc.map(color => (
                        <button
                            key={`hc-${colorIndex}-${color}`}
                            className="w-5 h-5 sm:w-6 sm:h-6 border rounded-full hover:scale-110 transition-transform"
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
            <div className="p-4">
              <p className="text-gray-500 text-sm text-center">Selecione uma peça de roupa no menu para alterar sua cor.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default HabboHubEditor;