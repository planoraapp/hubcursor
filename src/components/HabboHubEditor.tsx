
import React, { useState, useEffect, useRef } from 'react';

interface HabboFigurePart {
  id: string;
  type: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  club: boolean;
  sellable: boolean;
  colors: string[];
  previewUrl: string;
}

interface HabboColor {
  id: string;
  hex: string;
  name: string;
}

const HabboHubEditor: React.FC = () => {
  const [hotel, setHotel] = useState('habbo.com.br');
  const [username, setUsername] = useState('HabboHub');
  const [currentGender, setCurrentGender] = useState<'M' | 'F'>('M');
  const [currentLook, setCurrentLook] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('hd');
  const [direction, setDirection] = useState(2);
  const [headDirection, setHeadDirection] = useState(3);

  const [allFigurePartsData, setAllFigurePartsData] = useState<{[key: string]: HabboFigurePart[]}>({});
  const [allColorsData, setAllColorsData] = useState<{[key: string]: HabboColor}>({});
  const [selectedPartForColor, setSelectedPartForColor] = useState<{item: HabboFigurePart, currentColors: string[]} | null>(null);
  const [loading, setLoading] = useState(true);

  const itemsDisplayAreaRef = useRef<HTMLDivElement>(null);
  const colorSelectorAreaRef = useRef<HTMLDivElement>(null);

  // URLs Base
  const HABBO_IMAGING_BASE_URL = (hotel: string) => `https://www.${hotel}/habbo-imaging/avatarimage?`;
  const HABBO_API_PROFILE_URL = (username: string) => `https://www.habbo.com/api/public/users?name=${username}`;
  
  // URL da Edge Function - sem autenticação necessária
  const FIGURE_PARTS_API_URL = 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/get-habbo-figures';

  const DEFAULT_FIGURE_M = "hd-180-61.hr-3791-45.ch-3030-61.lg-3138-61.sh-905-61";
  const DEFAULT_FIGURE_F = "hd-180-1.hr-828-42.ch-665-92.lg-700-1.sh-705-1";

  const categoryPrefixMap: {[key: string]: string} = {
    'Rosto & Corpo': 'hd',
    'Cabelos': 'hr',
    'Parte de cima': 'ch',
    'Parte de baixo': 'lg',
    'Sapatos': 'sh',
    'Chapéus': 'he',
    'Acessórios Cabelo': 'ea', 
    'Óculos': 'fa' 
  };

  useEffect(() => {
    if (currentGender === 'M') {
      setCurrentLook(DEFAULT_FIGURE_M);
    } else {
      setCurrentLook(DEFAULT_FIGURE_F);
    }
  }, [currentGender]);

  useEffect(() => {
    const newUrl = buildHabboImageUrl(currentLook, currentGender, hotel, direction, headDirection, 'std', 'std', 0, 'l');
    setAvatarUrl(newUrl);
    console.log('NOVA URL FINAL DO AVATAR:', newUrl);
  }, [currentLook, currentGender, hotel, direction, headDirection]);

  const buildHabboImageUrl = (
    figure: string,
    gender: 'M' | 'F',
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

  const loadFigurePartsData = async () => {
    try {
      console.log('Carregando dados das peças de roupa...');
      
      // Requisição simples sem autenticação (já que a Edge Function está pública)
      const response = await fetch(FIGURE_PARTS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setAllFigurePartsData(data.figureParts);
      
      const colorsMap = data.colors.reduce((acc: {[key: string]: HabboColor}, color: HabboColor) => {
        acc[color.id] = color;
        return acc;
      }, {});
      setAllColorsData(colorsMap);

      console.log("Dados de visuais carregados:", Object.keys(data.figureParts));
      console.log("Cores carregadas:", Object.keys(colorsMap).length);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load figure parts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFigurePartsData();
  }, []);

  const getFigurePartCurrent = (figureString: string, partPrefix: string) => {
    const regex = new RegExp(`(^|\\.)(${partPrefix}-\\d+(?:-\\d+)?)(?=\\.|$)`);
    const match = figureString.match(regex);
    return match ? match[2] : '';
  };

  const getColorCodeFromFigurePart = (figurePartString: string) => {
    const parts = figurePartString.split('-');
    if (parts.length >= 3) {
      return parts[2];
    }
    return null;
  };

  const setFigurePart = (figureString: string, partPrefix: string, newPartId: string, newColorCode: string | null = null) => {
    let newFigure = figureString;
    const currentPartRegex = new RegExp(`(^|\\.)(${partPrefix}-\\d+(?:-\\d+)?)(?=\\.|$)`);
    const existingPartMatch = newFigure.match(currentPartRegex);

    let partToInsert = `${partPrefix}-${newPartId}`;
    if (newColorCode !== null) {
      partToInsert += `-${newColorCode}`;
    } else {
      const currentPartWithColor = getFigurePartCurrent(figureString, partPrefix);
      const currentPartColor = getColorCodeFromFigurePart(currentPartWithColor);
      if (currentPartColor) {
        partToInsert += `-${currentPartColor}`;
      }
    }

    if (existingPartMatch) {
      newFigure = newFigure.replace(existingPartMatch[0], `${existingPartMatch[1]}${partToInsert}`);
    } else {
      newFigure += (newFigure.length > 0 ? '.' : '') + partToInsert;
    }
    return newFigure;
  };

  const handleItemClick = (item: HabboFigurePart) => {
    const currentFigurePart = getFigurePartCurrent(currentLook, item.type);
    let currentColor = getColorCodeFromFigurePart(currentFigurePart);
    
    if (!currentColor && item.colors && item.colors.length > 0) {
      currentColor = item.colors[0];
    } else if (!currentColor) {
      currentColor = '1';
    }

    const newLook = setFigurePart(currentLook, item.type, item.id, currentColor);
    setCurrentLook(newLook);
    setSelectedPartForColor({ item: item, currentColors: [currentColor] });

    console.log(`Item selecionado: ${item.name}. Novo look: ${newLook}`);
  };

  const handleColorClick = (colorId: string) => {
    if (!selectedPartForColor) {
      alert('Selecione uma peça de roupa primeiro para alterar a cor.');
      return;
    }

    const { item } = selectedPartForColor;
    const newLook = setFigurePart(currentLook, item.type, item.id, colorId);
    setCurrentLook(newLook);
    setSelectedPartForColor({ item: item, currentColors: [colorId] });

    console.log(`Cor alterada para: ${colorId}. Novo look: ${newLook}`);
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

  const handleCopyFaceUrl = async () => {
    try {
      const faceUrl = avatarUrl.replace('headonly=0', 'headonly=1');
      await navigator.clipboard.writeText(faceUrl);
      alert('URL do rosto copiada para a área de transferência!');
    } catch (err) {
      console.error('Falha ao copiar: ', err);
      alert('Erro ao copiar a URL do rosto. Por favor, copie manualmente.');
    }
  };

  const rotateHead = (dir: 'left' | 'right') => {
    setHeadDirection(prev => (dir === 'left' ? (prev === 0 ? 7 : prev - 1) : (prev === 7 ? 0 : prev + 1)));
  };

  const rotateBody = (dir: 'left' | 'right') => {
    setDirection(prev => (dir === 'left' ? (prev === 0 ? 7 : prev - 1) : (prev === 7 ? 0 : prev + 1)));
  };

  const handleRandomize = () => {
    const partsToRandomize = Object.keys(allFigurePartsData);
    let newFigure = '';
    const newGender: 'M' | 'F' = Math.random() < 0.5 ? 'M' : 'F';
    
    partsToRandomize.forEach(partType => {
      const availableParts = allFigurePartsData[partType].filter(item => {
        if (item.gender === 'U') return true;
        if (newGender === 'M' && item.gender === 'M') return true;
        if (newGender === 'F' && item.gender === 'F') return true;
        return false;
      });

      if (availableParts && availableParts.length > 0) {
        const randomPart = availableParts[Math.floor(Math.random() * availableParts.length)];
        let randomColor = '1';
        if (randomPart.colors && randomPart.colors.length > 0) {
          randomColor = randomPart.colors[Math.floor(Math.random() * randomPart.colors.length)];
        }
        newFigure = setFigurePart(newFigure, partType, randomPart.id, randomColor);
      }
    });
    
    setCurrentLook(newFigure || (newGender === 'M' ? DEFAULT_FIGURE_M : DEFAULT_FIGURE_F));
    setCurrentGender(newGender);
    setDirection(Math.floor(Math.random() * 8));
    setHeadDirection(Math.floor(Math.random() * 8));
    
    alert('Avatar aleatorizado!');
  };

  const handleUsernameSearch = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      const searchUsername = target.value.trim();
      if (searchUsername) {
        try {
          const response = await fetch(`${HABBO_API_PROFILE_URL(searchUsername)}`);
          if (!response.ok) {
            throw new Error(`Usuário não encontrado! Status: ${response.status}`);
          }
          const userData = await response.json();
          
          const user = Array.isArray(userData) ? userData[0] : userData;
          
          if (user && user.figureString) {
            setCurrentLook(user.figureString);
            alert(`Visual de ${searchUsername} carregado com sucesso!`);
          } else {
            alert(`Não foi possível obter o visual de ${searchUsername}.`);
          }
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
          alert(`Erro ao buscar usuário: ${error.message}`);
        }
      }
    }
  };

  const filteredItems = allFigurePartsData[activeCategory] || [];
  const categoryFilteredItems = filteredItems.filter(item => {
    const matchesGender = item.gender === 'U' || item.gender === currentGender;
    return matchesGender;
  });

  const groupedItems = categoryFilteredItems.reduce((acc, item) => {
    let itemType = 'NORMAL';
    if (item.club) itemType = 'HC';
    else if (item.sellable) itemType = 'SELLABLE';
    
    if (!acc[itemType]) {
      acc[itemType] = [];
    }
    acc[itemType].push(item);
    return acc;
  }, {} as Record<string, HabboFigurePart[]>);

  const categoryImages = {
    hd: 'body.png',
    hr: 'hair.png',
    ch: 'tops.png',
    lg: 'bottoms.png',
    sh: 'shoes.png',
    he: 'hats.png',
    ea: 'eyes.png',
    fa: 'face.png',
  };

  const mainCategories = Object.keys(categoryPrefixMap);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
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
              <button onClick={handleRandomize} className="bg-blue-500 hover:bg-blue-600 text-white p-2 m-1 rounded cursor-pointer">Aleatorizar</button>
              <div className="flex gap-1">
                <button onClick={handleCopyUrl} className="bg-green-500 hover:bg-green-600 text-white p-2 flex-1 rounded text-sm">Copiar URL Completa</button>
                <button onClick={handleCopyFaceUrl} className="bg-green-500 hover:bg-green-600 text-white p-2 flex-1 rounded text-sm">Copiar URL Rosto</button>
              </div>
              
              <div className="flex flex-col w-full">
                <h2 className="font-sans text-slate-600 font-bold p-2 text-center text-sm">Seletor de Região</h2>
                <select
                  className="w-full p-2 border rounded-lg bg-white text-sm"
                  value={hotel}
                  onChange={(e) => setHotel(e.target.value)}
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
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleUsernameSearch}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Central: Seletor de Roupas */}
        <div className="w-full lg:w-5/12 max-h-[32rem] h-[32rem] bg-gray-50 order-1 lg:order-2">
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-8 h-[2.5rem] shadow-inner bg-gray-200">
            {mainCategories.slice(0, 8).map(type => {
              const categoryKey = categoryPrefixMap[type];
              return (
                <button
                  key={type}
                  className={`p-1 cursor-pointer hover:bg-gray-100 flex items-center justify-center ${activeCategory === categoryKey ? 'bg-gray-100 shadow-inner' : ''}`}
                  onClick={() => setActiveCategory(categoryKey)}
                >
                  <img 
                    decoding="async" 
                    className="w-4 h-4 sm:w-6 sm:h-6" 
                    src={`https://habbodefense.com/wp-content/uploads/2024/03/${categoryImages[categoryKey as keyof typeof categoryImages] || 'body.png'}`} 
                    alt={type}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/24x24?text=?';
                    }}
                  />
                </button>
              );
            })}
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
          <div ref={itemsDisplayAreaRef} className="flex flex-wrap justify-center max-h-[26.5rem] overflow-y-auto p-2">
            {loading ? (
              <p className="text-gray-500 text-center p-4 text-sm">Carregando peças de roupa...</p>
            ) : Object.keys(groupedItems).length > 0 ? (
              Object.keys(groupedItems).map(category => (
                <div key={category} className="w-full">
                  <h4 className={`font-bold mb-2 p-2 text-sm ${
                    category === 'HC' ? 'text-yellow-600' :
                    category === 'SELLABLE' ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {category}
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
                    {groupedItems[category].map(item => (
                      <button
                        key={`${item.type}-${item.id}-${category}`}
                        className={`relative rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 cursor-pointer hover:shadow-inner hover:bg-gray-300 ${
                          selectedPartForColor?.item.type === item.type && selectedPartForColor?.item.id === item.id
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : ''
                        }`}
                        onClick={() => handleItemClick(item)}
                        title={item.name}
                      >
                        {(item.club || category === 'HC') && (
                          <img
                            decoding="async"
                            className="absolute z-10 top-0 left-0 h-3 w-3 sm:h-4 sm:w-4"
                            src="https://habbodefense.com/wp-content/uploads/2024/03/hc_icon.png"
                            alt="hc icon"
                          />
                        )}
                        <div className="absolute rounded-full z-0 w-full h-full overflow-hidden">
                          <img
                            decoding="async"
                            style={{ transform: 'translateY(-2px)' }}
                            loading="lazy"
                            src={item.previewUrl}
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
          <div ref={colorSelectorAreaRef} className="flex flex-col h-[29rem] overflow-y-auto">
            {selectedPartForColor ? (
              <div className="p-2">
                <p className="text-sm mb-2 text-gray-700">Editando: <strong>{selectedPartForColor.item.name}</strong></p>
                <div className="mb-4">
                  <h2 className="font-sans text-slate-600 font-bold p-2 h-[2rem] bg-gray-100 rounded-lg mb-2 shadow-inner text-center text-sm">
                    Cores Disponíveis
                  </h2>
                  <div className="flex flex-wrap bg-gray-100 rounded-lg p-2 justify-center gap-1">
                    {selectedPartForColor.item.colors.map(colorId => {
                      const color = allColorsData[colorId];
                      if (color) {
                        return (
                          <button
                            key={colorId}
                            className="w-6 h-6 border rounded-full hover:scale-110 transition-transform"
                            style={{ backgroundColor: `#${color.hex}` }}
                            onClick={() => handleColorClick(colorId)}
                            title={color.name || `#${color.hex}`}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                {selectedPartForColor.item.colors.length === 0 && (
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
    </div>
  );
};

export default HabboHubEditor;
