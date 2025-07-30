
import React, { useState, useEffect, useRef } from 'react';

// Tipagens para os dados da API
interface HabboFigurePart {
    id: string;
    type: string;
    name: string;
    gender: 'M' | 'F' | 'U';
    club: boolean;
    sellable: boolean;
    colors: string[];
    previewUrl: string;
    originalFilename?: string;
}

interface HabboColor {
    id: string;
    hex: string;
    name: string;
}

interface FigurePartsResponse {
    figureParts: { [key: string]: HabboFigurePart[] };
    colors: HabboColor[];
}

const HabboHubEditor: React.FC = () => {
    // URLs Base
    const FIGURE_PARTS_API_URL = 'https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/get-habbo-figures';

    // Estados
    const DEFAULT_FIGURE_M = "hd-180-61.hr-3791-45.ch-3030-61.lg-3138-61.sh-905-61";
    const DEFAULT_FIGURE_F = "hd-180-1.hr-828-42.ch-665-92.lg-700-1.sh-705-1";

    const [hotel, setHotel] = useState('habbo.com.br');
    const [username, setUsername] = useState('HabboHub');
    const [currentGender, setCurrentGender] = useState<'M' | 'F'>('M');
    const [currentLook, setCurrentLook] = useState(DEFAULT_FIGURE_M);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('hr');
    const [direction, setDirection] = useState(2);
    const [headDirection, setHeadDirection] = useState(3);
    const [allFigurePartsData, setAllFigurePartsData] = useState<{[key: string]: HabboFigurePart[]}>({});
    const [allColorsData, setAllColorsData] = useState<{[key: string]: HabboColor}>({});
    const [selectedPartForColor, setSelectedPartForColor] = useState<{item: HabboFigurePart | null, currentColors: string[]} | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const myHabboImgRef = useRef<HTMLImageElement>(null);
    const itemsDisplayAreaRef = useRef<HTMLDivElement>(null);
    const colorSelectorAreaRef = useRef<HTMLDivElement>(null);

    const categoryPrefixMap: {[key: string]: string} = {
        'Rosto & Corpo': 'hd',
        'Cabelos': 'hr',
        'Parte de cima': 'ch',
        'Parte de baixo': 'lg',
        'Sapatos': 'sh',
        'Chapéus': 'he',
        'Acessórios Cabelo': 'ha',
        'Óculos': 'ea'
    };

    // Usar assets locais para as imagens das categorias
    const categoryImages: {[key: string]: string} = {
        'hd': '/assets/body.png',
        'hr': '/assets/hair.png', 
        'ch': '/assets/top.png',
        'lg': '/assets/bottom.png',
        'sh': '/assets/shoes.png',
        'he': '/assets/hat.png',
        'ha': '/assets/accessories.png',
        'ea': '/assets/glasses.png'
    };

    // Funções auxiliares
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

    const loadFigurePartsData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Carregando dados das peças de roupa...');
            
            const response = await fetch(FIGURE_PARTS_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
            }
            const data: FigurePartsResponse = await response.json();
            setAllFigurePartsData(data.figureParts);
            
            const colorsMap = data.colors.reduce((acc: {[key: string]: HabboColor}, color: HabboColor) => {
                acc[color.id] = color;
                return acc;
            }, {});
            setAllColorsData(colorsMap);

            console.log("Dados de visuais carregados:", Object.keys(data.figureParts));
            console.log("Cores carregadas:", Object.keys(colorsMap).length);

        } catch (error) {
            console.error('Failed to load figure parts:', error);
            setError('Erro ao carregar peças de roupa. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Handlers de eventos
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
        setSelectedPartForColor({ item, currentColors: [currentColor] });
    };

    const handleColorClick = (colorId: string) => {
        if (!selectedPartForColor || !selectedPartForColor.item) {
            alert('Selecione uma peça de roupa primeiro para alterar a cor.');
            return;
        }

        const { item } = selectedPartForColor;
        const newLook = setFigurePart(currentLook, item.type, item.id, colorId);
        setCurrentLook(newLook);
        setSelectedPartForColor({ item: item, currentColors: [colorId] });
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
            const availableParts = allFigurePartsData[partType]?.filter(item => {
                if (item.gender === 'U') return true;
                if (newGender === 'M' && item.gender === 'M') return true;
                if (newGender === 'F' && item.gender === 'F') return true;
                return false;
            }) || [];

            if (availableParts.length > 0) {
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
                    const hotelCode = hotel.split('.')[1] || hotel.split('.')[0];
                    const response = await fetch(`https://www.habbo.com/api/public/users?name=${searchUsername}&hotel=${hotelCode}`);
                    if (!response.ok) {
                        throw new Error(`Usuário não encontrado! Status: ${response.status}`);
                    }
                    const userData = await response.json();
                    
                    const user = Array.isArray(userData) ? userData[0] : userData;
                    
                    if (user && user.figureString) {
                        setCurrentLook(user.figureString);
                        const newGender: 'M' | 'F' = user.gender === 'M' ? 'M' : 'F';
                        setCurrentGender(newGender);
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

    // UseEffects
    useEffect(() => {
        loadFigurePartsData();
    }, []);

    useEffect(() => {
        const newAvatarUrl = buildHabboImageUrl(currentLook, currentGender, hotel, direction, headDirection);
        setAvatarUrl(newAvatarUrl);
    }, [currentLook, currentGender, hotel, direction, headDirection]);

    // Renderizar itens da categoria ativa
    useEffect(() => {
        if (!loading && itemsDisplayAreaRef.current) {
            itemsDisplayAreaRef.current.innerHTML = '';
            
            const items = allFigurePartsData[activeCategory] || [];
            const filteredItems = items.filter(item => {
                const matchesGender = item.gender === 'U' || item.gender === currentGender;
                return matchesGender;
            });

            if (filteredItems.length === 0) {
                itemsDisplayAreaRef.current.innerHTML = `<p class="text-gray-500 text-center p-4 text-sm">Nenhum item encontrado para esta categoria.</p>`;
                return;
            }

            const groupedItems = filteredItems.reduce((acc, item) => {
                let itemType = 'NORMAL';
                if (item.club) itemType = 'HC';
                else if (item.sellable) itemType = 'SELLABLE';
                
                if (!acc[itemType]) {
                    acc[itemType] = [];
                }
                acc[itemType].push(item);
                return acc;
            }, {} as Record<string, HabboFigurePart[]>);

            const typeOrder = ['NORMAL', 'HC', 'SELLABLE', 'NFT'];
            
            typeOrder.forEach(type => {
                if (groupedItems[type] && groupedItems[type].length > 0) {
                    const typeHeader = document.createElement('h4');
                    typeHeader.classList.add('font-bold', 'mb-2', 'p-2', 'text-sm');
                    typeHeader.textContent = type;
                    if (type === 'NORMAL') typeHeader.classList.add('text-gray-600');
                    if (type === 'HC') typeHeader.classList.add('text-yellow-600');
                    if (type === 'SELLABLE') typeHeader.classList.add('text-green-600');
                    if (type === 'NFT') typeHeader.classList.add('text-blue-600');
                    itemsDisplayAreaRef.current?.appendChild(typeHeader);

                    const grid = document.createElement('div');
                    grid.classList.add('grid', 'grid-cols-4', 'sm:grid-cols-6', 'lg:grid-cols-4', 'gap-2');

                    groupedItems[type].forEach(item => {
                        const itemButton = document.createElement('button');
                        itemButton.classList.add('relative', 'rounded-full', 'w-12', 'h-12', 'sm:w-14', 'sm:h-14', 'bg-gray-200', 'cursor-pointer', 'hover:shadow-inner', 'hover:bg-gray-300');
                        itemButton.title = item.name;

                        itemButton.innerHTML = `
                            ${item.club ? '<div class="absolute z-10 top-0 left-0 h-3 w-3 sm:h-4 sm:w-4 bg-yellow-400 rounded-full"></div>' : ''}
                            <div class="absolute rounded-full z-0 w-full h-full overflow-hidden">
                                <img loading="lazy" src="${item.previewUrl}" alt="${item.name}" class="w-full h-full object-contain" style="transform: translateY(-2px);" onerror="this.style.display='none';">
                            </div>
                        `;

                        itemButton.addEventListener('click', () => {
                            handleItemClick(item);
                        });
                        grid.appendChild(itemButton);
                    });
                    itemsDisplayAreaRef.current?.appendChild(grid);
                }
            });
        }
    }, [activeCategory, allFigurePartsData, currentGender, loading]);

    // Renderizar seletor de cores
    useEffect(() => {
        if (!selectedPartForColor || !colorSelectorAreaRef.current) return;
        
        colorSelectorAreaRef.current.innerHTML = '';

        const colorsToDisplay = selectedPartForColor.item?.colors || [];
        
        if (colorsToDisplay.length === 0) {
            colorSelectorAreaRef.current.innerHTML = `<div class="p-4"><p class="text-gray-500 text-sm text-center">Nenhuma opção de cor para esta peça.</p></div>`;
            return;
        }

        const colorGrid = document.createElement('div');
        colorGrid.classList.add('grid', 'grid-cols-5', 'gap-2', 'p-4');

        colorsToDisplay.forEach(colorId => {
            const color = allColorsData[colorId];
            if (color) {
                const colorButton = document.createElement('button');
                colorButton.classList.add('w-6', 'h-6', 'rounded-full', 'border', 'border-gray-300', 'cursor-pointer', 'hover:scale-110', 'transition-transform');
                colorButton.style.backgroundColor = color.hex;
                colorButton.title = color.name;
                
                if (selectedPartForColor?.currentColors.includes(colorId)) {
                    colorButton.classList.add('ring-2', 'ring-blue-500');
                }

                colorButton.addEventListener('click', () => {
                    handleColorClick(colorId);
                });
                colorGrid.appendChild(colorButton);
            }
        });
        colorSelectorAreaRef.current.appendChild(colorGrid);
    }, [selectedPartForColor, allColorsData]);

    if (loading) {
        return (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando peças de roupa...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={loadFigurePartsData}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

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
                                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white">←</div>
                                </div>
                                <div onClick={() => rotateBody('left')} className="cursor-pointer">
                                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white">←</div>
                                </div>
                            </div>
                            <div className="w-1/2 object-center relative">
                                <img 
                                    ref={myHabboImgRef} 
                                    id="myHabbo" 
                                    className="mx-auto max-w-full h-auto" 
                                    src={avatarUrl} 
                                    alt="Meu Habbo" 
                                    style={{ imageRendering: 'pixelated' }} 
                                />
                            </div>
                            <div className="w-1/4 h-full flex flex-col justify-center items-center gap-8">
                                <div onClick={() => rotateHead('right')} className="cursor-pointer">
                                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white">→</div>
                                </div>
                                <div onClick={() => rotateBody('right')} className="cursor-pointer">
                                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white">→</div>
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
                        {Object.keys(categoryPrefixMap).map(type => {
                            const categoryKey = categoryPrefixMap[type];
                            const imagePath = categoryImages[categoryKey];
                            return (
                                <button
                                    key={type}
                                    className={`p-1 cursor-pointer hover:bg-gray-100 flex items-center justify-center ${activeCategory === categoryKey ? 'bg-gray-100 shadow-inner' : ''}`}
                                    onClick={() => setActiveCategory(categoryKey)}
                                >
                                    <img 
                                        className="w-4 h-4 sm:w-6 sm:h-6" 
                                        src={imagePath}
                                        alt={type}
                                        onError={(e) => {
                                            // Fallback para texto se a imagem não carregar
                                            e.currentTarget.style.display = 'none';
                                            const span = document.createElement('span');
                                            span.textContent = type.charAt(0);
                                            span.className = 'text-xs font-bold';
                                            e.currentTarget.parentElement?.appendChild(span);
                                        }}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    <div className="h-[0.5rem] bg-gray-100"></div>
                    <div ref={itemsDisplayAreaRef} className="flex flex-wrap justify-center max-h-[26.5rem] overflow-y-auto p-2">
                        <p className="text-gray-500 text-center p-4 text-sm">Carregando itens...</p>
                    </div>
                </div>
                
                {/* Coluna Direita: Seletor de Cores */}
                <div className="w-full lg:w-3/12 max-h-[32rem] h-[32rem] bg-gray-50 order-3">
                    <h1 className="font-sans text-slate-600 font-bold w-full h-[2.5rem] bg-gray-200 p-2 shadow-inner text-center">Seletor de Cores</h1>
                    <div ref={colorSelectorAreaRef} className="flex flex-col h-[29rem] overflow-y-auto">
                        <div className="p-4">
                            <p className="text-gray-500 text-sm text-center">Selecione uma peça de roupa no menu para alterar sua cor.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HabboHubEditor;
