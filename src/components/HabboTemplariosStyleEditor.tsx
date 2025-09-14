import React, { useState, useEffect, useRef } from 'react';
import { 
  HABBO_PALETTES, 
  HABBO_CATEGORIES, 
  HABBO_EXPRESSIONS, 
  HABBO_ACTIONS, 
  HABBO_HAND_ITEMS,
  HABBO_SIZES,
  HABBO_FORMATS,
  HABBO_HOTELS
} from '../data/habboEditorData';
import { HABBO_TEMPLARIOS_PALETTES } from '../data/habboTemplariosData';
import { getOfficialColorPalette } from '../utils/partPreview';

interface HabboTemplariosStyleEditorProps {
  className?: string;
}

const HabboTemplariosStyleEditor: React.FC<HabboTemplariosStyleEditorProps> = ({ className = '' }) => {
  const [selectedHotel, setSelectedHotel] = useState('com.br');
  const [username, setUsername] = useState('ViaJovem');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedCategory, setSelectedCategory] = useState('hr');
  const [selectedColor1, setSelectedColor1] = useState('14');
  const [selectedColor2, setSelectedColor2] = useState('14');
  const [selectedExpression, setSelectedExpression] = useState('std');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedHandItem, setSelectedHandItem] = useState('');
  const [selectedSize, setSelectedSize] = useState('m');
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [figureString, setFigureString] = useState('');

  // Classe AvatarGenerate (adaptada para React)
  class AvatarGenerate {
    private parts: { [key: string]: string } = {};
    private colors: { [key: string]: string } = {};
    private gender: 'M' | 'F' = 'M';
    private headDirection: number = 2;
    private bodyDirection: number = 2;
    private expression: string = 'std';
    private action: string = '';
    private handItem: string = '';
    private size: string = 'm';
    private frame: number = 0;
    private format: string = 'png';

    constructor() {
      this.initializeDefaultParts();
    }

    private initializeDefaultParts() {
      this.parts = {
        'hr': '1',
        'hd': '1',
        'ch': '1',
        'lg': '1',
        'sh': '1',
        'ha': '',
        'he': '',
        'ea': '',
        'fa': '',
        'ca': '',
        'wa': '',
        'cc': '',
        'cp': ''
      };
      this.colors = {
        'hr': '14',
        'hd': '14',
        'ch': '14',
        'lg': '14',
        'sh': '14',
        'ha': '14',
        'he': '14',
        'ea': '14',
        'fa': '14',
        'ca': '14',
        'wa': '14',
        'cc': '14',
        'cp': '14'
      };
    }

    setPart(type: string, partId: string) {
      this.parts[type] = partId;
    }

    setColor(type: string, colorId: string) {
      this.colors[type] = colorId;
    }

    setGender(gender: 'M' | 'F') {
      this.gender = gender;
    }

    setHeadDirection(direction: number) {
      this.headDirection = direction;
    }

    setBodyDirection(direction: number) {
      this.bodyDirection = direction;
    }

    setExpression(expression: string) {
      this.expression = expression;
    }

    setAction(action: string) {
      this.action = action;
    }

    setHandItem(handItem: string) {
      this.handItem = handItem;
    }

    setSize(size: string) {
      this.size = size;
    }

    setFrame(frame: number) {
      this.frame = frame;
    }

    setFormat(format: string) {
      this.format = format;
    }

    buildFigureString(): string {
      let figureString = '';
      
      Object.keys(this.parts).forEach(type => {
        const partId = this.parts[type];
        if (partId && partId !== '') {
          const color1 = this.colors[type];
          const color2 = this.colors[type]; // Para duotone, usar a mesma cor por enquanto
          figureString += `${type}-${partId}-${color1}-${color2},`;
        }
      });

      return figureString.slice(0, -1); // Remove a última vírgula
    }

    generateAvatarUrl(hotel: string, username?: string): string {
      const baseUrl = `https://www.habbo.${hotel}/habbo-imaging/avatarimage`;
      const figure = this.buildFigureString();
      
      const params = new URLSearchParams({
        figure: figure || 'hd-1-14-14',
        gender: this.gender,
        action: this.action,
        direction: this.bodyDirection.toString(),
        head_direction: this.headDirection.toString(),
        img_format: this.format,
        gesture: this.expression,
        frame: this.frame.toString(),
        headonly: '0',
        size: this.size
      });

      if (username) {
        params.set('user', username);
      }

      return `${baseUrl}?${params.toString()}`;
    }
  }

  const avatarGenerator = useRef(new AvatarGenerate());

  // Função para obter itens da categoria atual organizados por seções
  const getCurrentCategoryItems = () => {
    const category = HABBO_CATEGORIES.find(cat => cat.type === selectedCategory);
    if (!category) return { hc: [], nonhc: [], sellable: [], nft: [], rare: [] };

    const items = Object.entries(category.sets);
    
    return {
      hc: items.filter(([_, itemData]) => itemData.club === 2),
      nonhc: items.filter(([_, itemData]) => itemData.club === 0 && itemData.sellable === 1 && itemData.nft === 0),
      sellable: items.filter(([_, itemData]) => itemData.sellable === 1 && itemData.club === 0),
      nft: items.filter(([_, itemData]) => itemData.nft === 1),
      rare: items.filter(([_, itemData]) => itemData.raro === 1)
    };
  };

  // Função para obter cores da paleta atual (mapeando por categoria)
  const getCurrentPalette = () => {
    // Pele (hd) usa paleta 1 completa (Templários)
    if (selectedCategory === 'hd') {
      return HABBO_TEMPLARIOS_PALETTES['1'];
    }

    // Demais categorias: usar paleta oficial "default" (ids válidos para cabelo/roupas)
    const official = getOfficialColorPalette('default');
    const palette: Record<string, { index: number; club: number; selectable: number; hex: string }> = {};
    official.forEach((c, idx) => {
      palette[c.id] = { index: idx, club: 0, selectable: 1, hex: c.hex.replace('#', '') };
    });
    return palette;
  };

  // Função para atualizar o avatar
  const updateAvatar = () => {
    avatarGenerator.current.setGender(selectedGender);
    avatarGenerator.current.setHeadDirection(2);
    avatarGenerator.current.setBodyDirection(2);
    avatarGenerator.current.setExpression(selectedExpression);
    avatarGenerator.current.setAction(selectedAction);
    avatarGenerator.current.setHandItem(selectedHandItem);
    avatarGenerator.current.setSize(selectedSize);
    avatarGenerator.current.setFrame(selectedFrame);
    avatarGenerator.current.setFormat(selectedFormat);

    const newUrl = avatarGenerator.current.generateAvatarUrl(selectedHotel, username);
    const newFigure = avatarGenerator.current.buildFigureString();
    
    setAvatarUrl(newUrl);
    setFigureString(newFigure);
  };

  // Função para buscar figura por usuário
  const fetchUserFigure = async () => {
    if (!username) return;
    
    try {
      const response = await fetch(`https://www.habbo.${selectedHotel}/api/public/users?name=${username}`);
      const data = await response.json();
      
      if (data.figureString) {
        // Importar figura do usuário
        const figureParts = data.figureString.split('.');
        figureParts.forEach((part: string) => {
          const [type, partId, color1, color2] = part.split('-');
          if (type && partId) {
            avatarGenerator.current.setPart(type, partId);
            avatarGenerator.current.setColor(type, color1 || '14');
          }
        });
        updateAvatar();
      }
    } catch (error) {
          }
  };

  // Função para copiar URL da imagem
  const copyImageUrl = () => {
    navigator.clipboard.writeText(avatarUrl).then(() => {
      alert('URL copiada para a área de transferência!');
    }).catch(() => {
      alert('Erro ao copiar URL. Tente novamente.');
    });
  };

  // Função para baixar a imagem
  const downloadImage = async () => {
    try {
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habbo-avatar-${username || 'avatar'}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
            alert('Erro ao baixar a imagem. Tente novamente.');
    }
  };

  // Atualizar avatar quando os parâmetros mudarem
  useEffect(() => {
    // garantir que a cor selecionada exista na paleta da categoria atual
    const palette = getCurrentPalette();
    if (palette) {
      if (!palette[selectedColor1]) {
        const firstSelectable = Object.entries(palette).find(([_, c]) => c.selectable === 1)?.[0] || '14';
        setSelectedColor1(firstSelectable);
      }
      if (!palette[selectedColor2]) {
        const firstSelectable2 = Object.entries(palette).find(([_, c]) => c.selectable === 1)?.[0] || '14';
        setSelectedColor2(firstSelectable2);
      }
    }

    // aplicar cor atual no gerador para a categoria ativa
    if (selectedCategory) {
      avatarGenerator.current.setColor(selectedCategory, selectedColor1);
    }

    updateAvatar();
  }, [selectedHotel, username, selectedGender, selectedCategory, selectedColor1, selectedColor2, selectedExpression, selectedAction, selectedHandItem, selectedSize, selectedFrame, selectedFormat]);

  // Função para renderizar itens de roupa
  const renderClothingItems = (items: [string, any][], sectionClass: string) => {
    return items.map(([itemId, itemData]) => {
      if (itemData.gender !== selectedGender && itemData.gender !== 'U') return null;
      
      let itemClass = 'clothes-item';
      if (itemData.club === 2) itemClass += ' hc';
      if (itemData.sellable === 1) itemClass += ' sellable';
      if (itemData.nft === 1) itemClass += ' nft';
      if (itemData.raro === 1) itemClass += ' rare';

      // Construir a figura string corretamente para o preview
      const figureString = `${selectedCategory}-${itemId}-${selectedColor1}-${selectedColor2}`;
      
      // URL correta para o Habbo Imaging API com gênero correto
      const imageUrl = `https://www.habbo.${selectedHotel}/habbo-imaging/avatarimage?figure=${figureString}&gender=${selectedGender}&direction=2&head_direction=2&gesture=std&size=m`;

      return (
        <div
          key={itemId}
          className={`${itemClass} ${sectionClass}`}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={() => {
            avatarGenerator.current.setPart(selectedCategory, itemId);
            avatarGenerator.current.setColor(selectedCategory, selectedColor1);
            updateAvatar();
          }}
          title={`${selectedCategory.toUpperCase()}-${itemId} (${selectedGender === 'M' ? 'Masculino' : 'Feminino'})`}
        />
      );
    });
  };

  return (
    <div 
      className={`min-h-screen p-5 ${className}`} 
      style={{ 
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div 
        className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div 
          className="text-white p-5 text-center"
          style={{ background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' }}
        >
          <h1 className="text-3xl font-bold mb-2">🎨 Editor de Visuais Habbo</h1>
          <p className="text-lg">Crie e experimente diferentes looks para o seu Habbo!</p>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Avatar Section */}
          <div className="flex-1 p-5 bg-gray-50 border-r border-gray-200">
            <div className="text-center mb-5">
              {/* Direction Controls */}
              <div className="flex justify-center items-center gap-2 mb-2">
                <button className="px-2 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50 rounded">
                  ←
                </button>
                <span className="text-sm font-medium">Cabeça</span>
                <button className="px-2 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50 rounded">
                  →
                </button>
              </div>
              
              {/* Avatar Image */}
              <img 
                src={avatarUrl} 
                alt="Avatar Habbo" 
                className="mx-auto max-w-[200px] border-2 border-gray-800 rounded"
                style={{ imageRendering: 'pixelated' }}
              />
              
              <div className="flex justify-center items-center gap-2 mt-2">
                <button className="px-2 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50 rounded">
                  ←
                </button>
                <span className="text-sm font-medium">Corpo</span>
                <button className="px-2 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50 rounded">
                  →
                </button>
              </div>
            </div>

            {/* Form Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Nome do Habbo:
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ViaJovem"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Hotel:
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                >
                  {HABBO_HOTELS.map(hotel => (
                    <option key={hotel.value} value={hotel.value}>
                      {hotel.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
                  onClick={fetchUserFigure}
                >
                  Buscar Figura
                </button>
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700"
                  onClick={downloadImage}
                >
                  Baixar Imagem
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                  onClick={copyImageUrl}
                >
                  Copiar URL
                </button>
              </div>

              <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded text-xs break-all">
                <strong>URL da Imagem:</strong><br />
                {avatarUrl}
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex-[2] p-5 bg-white">
            {/* Category Navigation */}
            <div className="flex flex-wrap gap-2 mb-5">
              {HABBO_CATEGORIES.map(category => (
                <button 
                  key={category.type}
                  className={`px-3 py-2 border rounded font-bold text-sm ${
                    selectedCategory === category.type 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCategory(category.type)}
                >
                  {category.type.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Gender Selector */}
            <div className="flex gap-2 mb-5">
              <button 
                className={`px-4 py-2 border rounded font-bold ${
                  selectedGender === 'M' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedGender('M')}
              >
                Masculino
              </button>
              <button 
                className={`px-4 py-2 border rounded font-bold ${
                  selectedGender === 'F' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedGender('F')}
              >
                Feminino
              </button>
            </div>

            {/* Clothes Grid with Sections */}
            <div className="mb-5 max-h-[400px] overflow-y-auto border border-gray-300 p-3 rounded">
              <div className="space-y-4">
                {/* HC Items */}
                {getCurrentCategoryItems().hc.length > 0 && (
                  <div>
                    <h4 className="font-bold text-yellow-600 mb-2">HC</h4>
                    <div className="grid grid-cols-8 gap-1">
                      {renderClothingItems(getCurrentCategoryItems().hc, 'hc')}
                    </div>
                  </div>
                )}

                {/* Non-HC Items */}
                {getCurrentCategoryItems().nonhc.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-600 mb-2">Não-HC</h4>
                    <div className="grid grid-cols-8 gap-1">
                      {renderClothingItems(getCurrentCategoryItems().nonhc, 'nonhc')}
                    </div>
                  </div>
                )}

                {/* Sellable Items */}
                {getCurrentCategoryItems().sellable.length > 0 && (
                  <div>
                    <h4 className="font-bold text-green-600 mb-2">Vendável</h4>
                    <div className="grid grid-cols-8 gap-1">
                      {renderClothingItems(getCurrentCategoryItems().sellable, 'sellable')}
                    </div>
                  </div>
                )}

                {/* NFT Items */}
                {getCurrentCategoryItems().nft.length > 0 && (
                  <div>
                    <h4 className="font-bold text-purple-600 mb-2">NFT</h4>
                    <div className="grid grid-cols-8 gap-1">
                      {renderClothingItems(getCurrentCategoryItems().nft, 'nft')}
                    </div>
                  </div>
                )}

                {/* Rare Items */}
                {getCurrentCategoryItems().rare.length > 0 && (
                  <div>
                    <h4 className="font-bold text-red-600 mb-2">Raro</h4>
                    <div className="grid grid-cols-8 gap-1">
                      {renderClothingItems(getCurrentCategoryItems().rare, 'rare')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Colors Section */}
            <div className="flex gap-5 mb-5">
              <div className="flex-1">
                <div className="text-sm font-bold mb-2">Cores Single Tone</div>
                <div className="bg-gray-100 rounded-md p-2 space-y-2">
                  <div className="grid grid-cols-8 gap-1" id="nonhc">
                    {Object.entries(getCurrentPalette())
                      .filter(([_, c]) => c.selectable === 1 && c.club === 0)
                      .map(([colorId, colorData]) => (
                        <div
                          key={`s1-${colorId}`}
                          className={`w-7 h-7 border-2 cursor-pointer rounded ${
                            selectedColor1 === colorId ? 'border-blue-500' : 'border-gray-300'
                          } hover:border-gray-500`}
                          style={{ backgroundColor: `#${colorData.hex}` }}
                          onClick={() => {
                            setSelectedColor1(colorId);
                            avatarGenerator.current.setColor(selectedCategory, colorId);
                            updateAvatar();
                          }}
                          title={`Cor ${colorId} - #${colorData.hex}`}
                        />
                      ))}
                  </div>
                  <div className="grid grid-cols-8 gap-1" id="hc">
                    {Object.entries(getCurrentPalette())
                      .filter(([_, c]) => c.selectable === 1 && c.club === 2)
                      .map(([colorId, colorData]) => (
                        <div
                          key={`s2-${colorId}`}
                          className={`w-7 h-7 border-2 cursor-pointer rounded ring-2 ring-yellow-500 ${
                            selectedColor1 === colorId ? 'border-blue-500' : 'border-gray-300'
                          } hover:border-gray-500`}
                          style={{ backgroundColor: `#${colorData.hex}` }}
                          onClick={() => {
                            setSelectedColor1(colorId);
                            avatarGenerator.current.setColor(selectedCategory, colorId);
                            updateAvatar();
                          }}
                          title={`Cor (HC) ${colorId} - #${colorData.hex}`}
                        />
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm font-bold mb-2">Cores DuoTone</div>
                <div className="bg-gray-100 rounded-md p-2 space-y-2">
                  <div className="grid grid-cols-8 gap-1" id="second-tone-nonhc">
                    {Object.entries(getCurrentPalette())
                      .filter(([_, c]) => c.selectable === 1 && c.club === 0)
                      .map(([colorId, colorData]) => (
                        <div
                          key={`d1-${colorId}`}
                          className={`w-7 h-7 border-2 cursor-pointer rounded ${
                            selectedColor2 === colorId ? 'border-blue-500' : 'border-gray-300'
                          } hover:border-gray-500`}
                          style={{ backgroundColor: `#${colorData.hex}` }}
                          onClick={() => {
                            setSelectedColor2(colorId);
                            // Duotone real: quando implementado, aplicar no segundo slot
                            avatarGenerator.current.setColor(selectedCategory, colorId);
                            updateAvatar();
                          }}
                          title={`DuoTone ${colorId} - #${colorData.hex}`}
                        />
                      ))}
                  </div>
                  <div className="grid grid-cols-8 gap-1" id="second-tone-hc">
                    {Object.entries(getCurrentPalette())
                      .filter(([_, c]) => c.selectable === 1 && c.club === 2)
                      .map(([colorId, colorData]) => (
                        <div
                          key={`d2-${colorId}`}
                          className={`w-7 h-7 border-2 cursor-pointer rounded ring-2 ring-yellow-500 ${
                            selectedColor2 === colorId ? 'border-blue-500' : 'border-gray-300'
                          } hover:border-gray-500`}
                          style={{ backgroundColor: `#${colorData.hex}` }}
                          onClick={() => {
                            setSelectedColor2(colorId);
                            avatarGenerator.current.setColor(selectedCategory, colorId);
                            updateAvatar();
                          }}
                          title={`DuoTone (HC) ${colorId} - #${colorData.hex}`}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Expression */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-sm font-bold mb-2">Expressão</div>
                <div className="flex gap-1 flex-wrap">
                  {HABBO_EXPRESSIONS.map(expr => (
                    <button
                      key={expr.value}
                      className={`px-2 py-1 border text-xs rounded ${
                        selectedExpression === expr.value 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedExpression(expr.value)}
                    >
                      {expr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-sm font-bold mb-2">Ação</div>
                <div className="flex gap-1 flex-wrap">
                  {HABBO_ACTIONS.map(action => (
                    <button
                      key={action.value || 'none'}
                      className={`px-2 py-1 border text-xs rounded ${
                        selectedAction === action.value 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAction(action.value)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hand Item */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-sm font-bold mb-2">Item na Mão</div>
                <div className="flex gap-1 flex-wrap">
                  {HABBO_HAND_ITEMS.map(item => (
                    <button
                      key={item.value || 'none'}
                      className={`px-2 py-1 border text-xs rounded ${
                        selectedHandItem === item.value 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedHandItem(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-sm font-bold mb-2">Tamanho</div>
                <div className="flex gap-1 flex-wrap">
                  {HABBO_SIZES.map(size => (
                    <button
                      key={size.value}
                      className={`px-2 py-1 border text-xs rounded ${
                        selectedSize === size.value 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSize(size.value)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-sm font-bold mb-2">Frame</div>
                <div className="flex gap-1 flex-wrap">
                  {[0, 1, 2, 3, 4, 5].map(frame => (
                    <button
                      key={frame}
                      className={`px-2 py-1 border text-xs rounded ${
                        selectedFrame === frame 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFrame(frame)}
                    >
                      {frame}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-sm font-bold mb-2">Formato</div>
                <div className="flex gap-1 flex-wrap">
                  {HABBO_FORMATS.map(format => (
                    <button
                      key={format.value}
                      className={`px-2 py-1 border text-xs rounded ${
                        selectedFormat === format.value 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFormat(format.value)}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .clothes-item {
          width: 50px;
          height: 50px;
          border: 1px solid #ccc;
          cursor: pointer;
          background-size: cover;
          background-position: center;
          border-radius: 3px;
        }
        
        .clothes-item:hover {
          border-color: #007bff;
        }
        
        .clothes-item.hc {
          border-color: #ffc107;
          border-width: 2px;
        }
        
        .clothes-item.sellable {
          border-color: #28a745;
          border-width: 2px;
        }
        
        .clothes-item.nft {
          border-color: #6f42c1;
          border-width: 2px;
        }
        
        .clothes-item.rare {
          border-color: #dc3545;
          border-width: 2px;
        }
      `}</style>
    </div>
  );
};

export default HabboTemplariosStyleEditor;
