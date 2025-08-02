import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ViaJovemEditorProps {
  className?: string;
}

export const ViaJovemEditor = ({ className = '' }: ViaJovemEditorProps) => {
  const [currentFigure, setCurrentFigure] = useState('hd-190-7.hr-100-61.ch-210-66.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState('M');
  const [selectedHotel, setSelectedHotel] = useState('habbohub');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedSubNav, setSelectedSubNav] = useState('gender');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('7');
  const [selectedItem, setSelectedItem] = useState('190');
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Sample clothing data based on ViaJovem structure
  const clothingData = {
    hd: {
      hc: [
        { id: '3091', name: 'Rosto HC 1', rarity: 'hc' },
        { id: '3092', name: 'Rosto HC 2', rarity: 'hc' },
        { id: '3093', name: 'Rosto HC 3', rarity: 'hc' },
        { id: '3094', name: 'Rosto HC 4', rarity: 'hc' },
        { id: '3095', name: 'Rosto HC 5', rarity: 'hc' },
      ],
      sell: [
        { id: '3600', name: 'Olhos Mil e Uma Noites', rarity: 'sellable', duotone: true },
        { id: '3603', name: 'Olhos Zumbi', rarity: 'sellable' },
        { id: '3604', name: 'Olhos Demoníacos', rarity: 'sellable' },
        { id: '3631', name: 'Maquiagem Boneca de Porcelana', rarity: 'sellable', duotone: true },
        { id: '3704', name: 'Máscara Robótica', rarity: 'sellable' },
      ],
      raro: [
        { id: '3536', name: 'Cara de Gato Demoníaco', rarity: 'raro', duotone: true },
        { id: '3537', name: 'Olho do Ciclope', rarity: 'raro' },
        { id: '3721', name: 'Look Vampiresco', rarity: 'raro' },
        { id: '4015', name: 'Emoções Cibernéticas', rarity: 'raro' },
      ],
      nft: [
        { id: '4202', name: 'NFT Clothing 1', rarity: 'nft' },
        { id: '4203', name: 'NFT Clothing 2', rarity: 'nft' },
        { id: '5041', name: 'Rosto de Boneca', rarity: 'nft' },
        { id: '5042', name: 'Rosto Boneca Possuída', rarity: 'nft' },
      ],
      nonhc: [
        { id: '180', name: 'Rosto Básico 1', rarity: 'free' },
        { id: '185', name: 'Rosto Básico 2', rarity: 'free' },
        { id: '190', name: 'Rosto Básico 3', rarity: 'free' },
        { id: '195', name: 'Rosto Básico 4', rarity: 'free' },
        { id: '200', name: 'Rosto Básico 5', rarity: 'free' },
        { id: '205', name: 'Rosto Básico 6', rarity: 'free' },
        { id: '206', name: 'Rosto Básico 7', rarity: 'free' },
        { id: '207', name: 'Rosto Básico 8', rarity: 'free' },
        { id: '208', name: 'Rosto Básico 9', rarity: 'free' },
        { id: '209', name: 'Rosto Básico 10', rarity: 'free' },
      ]
    },
    hr: {
      nonhc: [
        { id: '1', name: 'Cabelo Básico 1', rarity: 'free' },
        { id: '2', name: 'Cabelo Básico 2', rarity: 'free' },
        { id: '3', name: 'Cabelo Básico 3', rarity: 'free' },
        { id: '5', name: 'Cabelo Básico 5', rarity: 'free' },
        { id: '6', name: 'Cabelo Básico 6', rarity: 'free' },
        { id: '7', name: 'Cabelo Básico 7', rarity: 'free' },
        { id: '9', name: 'Cabelo Básico 9', rarity: 'free' },
        { id: '10', name: 'Cabelo Básico 10', rarity: 'free' },
        { id: '11', name: 'Cabelo Básico 11', rarity: 'free' },
        { id: '13', name: 'Cabelo Básico 13', rarity: 'free' },
      ],
      hc: [
        { id: '4', name: 'Cabelo HC 4', rarity: 'hc' },
        { id: '8', name: 'Cabelo HC 8', rarity: 'hc' },
        { id: '12', name: 'Cabelo HC 12', rarity: 'hc' },
        { id: '16', name: 'Cabelo HC 16', rarity: 'hc' },
        { id: '20', name: 'Cabelo HC 20', rarity: 'hc' },
        { id: '24', name: 'Cabelo HC 24', rarity: 'hc' },
        { id: '28', name: 'Cabelo HC 28', rarity: 'hc' },
      ]
    },
    ch: {
      nonhc: [
        { id: '1', name: 'Camiseta Básica 1', rarity: 'free' },
        { id: '2', name: 'Camiseta Básica 2', rarity: 'free' },
        { id: '3', name: 'Camiseta Básica 3', rarity: 'free' },
        { id: '5', name: 'Camiseta Básica 5', rarity: 'free' },
        { id: '6', name: 'Camiseta Básica 6', rarity: 'free' },
        { id: '7', name: 'Camiseta Básica 7', rarity: 'free' },
        { id: '9', name: 'Camiseta Básica 9', rarity: 'free' },
        { id: '10', name: 'Camiseta Básica 10', rarity: 'free' },
      ],
      hc: [
        { id: '4', name: 'Camiseta HC 4', rarity: 'hc' },
        { id: '8', name: 'Camiseta HC 8', rarity: 'hc' },
        { id: '12', name: 'Camiseta HC 12', rarity: 'hc' },
        { id: '16', name: 'Camiseta HC 16', rarity: 'hc' },
        { id: '20', name: 'Camiseta HC 20', rarity: 'hc' },
        { id: '24', name: 'Camiseta HC 24', rarity: 'hc' },
      ]
    },
    lg: {
      nonhc: [
        { id: '1', name: 'Calça Básica 1', rarity: 'free' },
        { id: '2', name: 'Calça Básica 2', rarity: 'free' },
        { id: '3', name: 'Calça Básica 3', rarity: 'free' },
        { id: '5', name: 'Calça Básica 5', rarity: 'free' },
        { id: '6', name: 'Calça Básica 6', rarity: 'free' },
        { id: '7', name: 'Calça Básica 7', rarity: 'free' },
        { id: '9', name: 'Calça Básica 9', rarity: 'free' },
        { id: '10', name: 'Calça Básica 10', rarity: 'free' },
      ],
      hc: [
        { id: '4', name: 'Calça HC 4', rarity: 'hc' },
        { id: '8', name: 'Calça HC 8', rarity: 'hc' },
        { id: '12', name: 'Calça HC 12', rarity: 'hc' },
        { id: '16', name: 'Calça HC 16', rarity: 'hc' },
        { id: '20', name: 'Calça HC 20', rarity: 'hc' },
      ]
    },
    sh: {
      nonhc: [
        { id: '1', name: 'Sapato Básico 1', rarity: 'free' },
        { id: '2', name: 'Sapato Básico 2', rarity: 'free' },
        { id: '3', name: 'Sapato Básico 3', rarity: 'free' },
        { id: '5', name: 'Sapato Básico 5', rarity: 'free' },
        { id: '6', name: 'Sapato Básico 6', rarity: 'free' },
        { id: '7', name: 'Sapato Básico 7', rarity: 'free' },
      ],
      hc: [
        { id: '4', name: 'Sapato HC 4', rarity: 'hc' },
        { id: '8', name: 'Sapato HC 8', rarity: 'hc' },
        { id: '12', name: 'Sapato HC 12', rarity: 'hc' },
        { id: '16', name: 'Sapato HC 16', rarity: 'hc' },
      ]
    }
  };

  // Color palettes
  const colorPalettes = {
    nonhc: [
      { id: '1', hex: '#F5DA88', name: 'Amarelo Claro' },
      { id: '2', hex: '#FFDBC1', name: 'Pêssego' },
      { id: '3', hex: '#FFCB98', name: 'Bege' },
      { id: '4', hex: '#F4AC54', name: 'Laranja' },
      { id: '5', hex: '#FF987F', name: 'Salmão' },
      { id: '6', hex: '#e0a9a9', name: 'Rosa Claro' },
      { id: '7', hex: '#ca8154', name: 'Marrom Claro' },
      { id: '8', hex: '#B87560', name: 'Marrom' },
      { id: '9', hex: '#9C543F', name: 'Marrom Escuro' },
      { id: '10', hex: '#904925', name: 'Marrom Chocolate' },
      { id: '11', hex: '#4C311E', name: 'Marrom Muito Escuro' },
    ],
    hc: [
      { id: '12', hex: '#543d35', name: 'HC Marrom 1' },
      { id: '13', hex: '#653a1d', name: 'HC Marrom 2' },
      { id: '14', hex: '#6E392C', name: 'HC Marrom 3' },
      { id: '15', hex: '#714947', name: 'HC Cinza' },
      { id: '16', hex: '#856860', name: 'HC Bege' },
      { id: '17', hex: '#895048', name: 'HC Terra' },
      { id: '18', hex: '#a15253', name: 'HC Rosé' },
      { id: '19', hex: '#aa7870', name: 'HC Rosa' },
      { id: '20', hex: '#be8263', name: 'HC Dourado' },
      { id: '21', hex: '#FF5757', name: 'HC Vermelho' },
      { id: '22', hex: '#FF7575', name: 'HC Vermelho Claro' },
      { id: '23', hex: '#5DC446', name: 'HC Verde' },
      { id: '24', hex: '#6799CC', name: 'HC Azul' },
      { id: '25', hex: '#D288CE', name: 'HC Roxo' },
    ]
  };

  const getAvatarUrl = () => {
    const hotel = selectedHotel === 'habbohub' ? 'www.habbo.com' : `www.habbo.${selectedHotel}`;
    return `https://${hotel}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std&size=l`;
  };

  const getClothingImageUrl = (category: string, itemId: string, color: string = '7') => {
    const hotel = selectedHotel === 'habbohub' ? 'www.habbo.com' : `www.habbo.${selectedHotel}`;
    return `https://${hotel}/habbo-imaging/avatarimage?figure=${category}-${itemId}-${color}&gender=${selectedGender}&size=s&direction=2&head_direction=2`;
  };

  const handleSearchUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome de usuário válido",
        variant: "destructive"
      });
      return;
    }

    try {
      const hotel = selectedHotel === 'habbohub' ? 'com' : selectedHotel;
      const response = await fetch(`https://www.habbo.${hotel}/api/public/users?name=${username}`);
      
      if (!response.ok) throw new Error('Usuário não encontrado');
      
      const data = await response.json();
      if (data.figureString) {
        setCurrentFigure(data.figureString);
        toast({
          title: "Sucesso",
          description: `Visual de ${data.name} carregado!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
    }
  };

  const handleRotateAvatar = () => {
    setCurrentDirection(prev => {
      const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
      const currentIndex = directions.indexOf(prev);
      return directions[(currentIndex + 1) % directions.length];
    });
  };

  const handleCategoryClick = (category: string, subnav: string) => {
    setSelectedCategory(category);
    setSelectedSubNav(subnav);
  };

  const handleGenderClick = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleClothingClick = (clothing: string) => {
    setSelectedItem(clothing);
    
    // Update figure string
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    // Remove existing category part
    const filteredParts = figureParts.filter(part => !categoryPattern.test(part));
    
    // Add new category part
    const newPart = `${selectedCategory}-${clothing}-${selectedColor}`;
    filteredParts.push(newPart);
    
    setCurrentFigure(filteredParts.join('.'));
  };

  const handleColorClick = (colorId: string) => {
    setSelectedColor(colorId);
    
    // Update figure with new color
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    // Update existing category part with new color
    const updatedParts = figureParts.map(part => {
      if (categoryPattern.test(part)) {
        const [cat, item] = part.split('-');
        return `${cat}-${item}-${colorId}`;
      }
      return part;
    });
    
    setCurrentFigure(updatedParts.join('.'));
  };

  const copyFigure = () => {
    navigator.clipboard.writeText(currentFigure);
    toast({
      title: "Copiado!",
      description: "String do visual copiada para a área de transferência",
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getAvatarUrl());
    toast({
      title: "Copiado!",
      description: "URL do avatar copiada para a área de transferência",
    });
  };

  const randomizeAvatar = () => {
    const categories = ['hd', 'hr', 'ch', 'lg', 'sh'];
    const newFigureParts = [];

    categories.forEach(category => {
      const categoryData = clothingData[category as keyof typeof clothingData];
      if (categoryData) {
        const allItems = [...(categoryData.nonhc || []), ...(categoryData.hc || [])];
        if (allItems.length > 0) {
          const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
          const randomColor = Math.floor(Math.random() * 11) + 1;
          newFigureParts.push(`${category}-${randomItem.id}-${randomColor}`);
        }
      }
    });

    setCurrentFigure(newFigureParts.join('.'));
    toast({
      title: "Avatar Randomizado!",
      description: "Novo visual gerado aleatoriamente",
    });
  };

  const getCurrentCategoryItems = () => {
    const categoryData = clothingData[selectedCategory as keyof typeof clothingData];
    if (!categoryData) return [];

    const allItems = Object.values(categoryData).flat();
    
    if (searchTerm) {
      return allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.includes(searchTerm)
      );
    }
    
    return allItems;
  };

  const filteredItems = getCurrentCategoryItems();

  return (
    <div className={`via-jovem-editor ${className}`} ref={containerRef}>
      <style>{`
        .via-jovem-editor {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .via-jovem-editor .col-md-6 {
          background-color: var(--submenu-bg, #f8f9fa);
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .via-jovem-editor .main-navigation ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .via-jovem-editor .main-navigation li a {
          display: block;
          padding: 8px;
          border-radius: 4px;
          transition: all 0.2s;
          text-decoration: none;
          border: 2px solid transparent;
        }
        
        .via-jovem-editor .main-navigation li a.active {
          background-color: rgba(0,123,255,0.2);
          border-color: #007bff;
        }
        
        .via-jovem-editor .main-navigation li a:hover {
          background-color: rgba(0,123,255,0.1);
        }
        
        .via-jovem-editor .main-navigation li a img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          display: block;
        }
        
        .via-jovem-editor .sub-navigation ul {
          list-style: none;
          padding: 0;
          margin: 10px 0;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .via-jovem-editor .sub-navigation ul.hidden {
          display: none;
        }
        
        .via-jovem-editor .sub-navigation ul.display {
          display: flex;
        }
        
        .via-jovem-editor .sub-navigation li a {
          display: block;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s;
          text-decoration: none;
          border: 2px solid transparent;
        }
        
        .via-jovem-editor .sub-navigation li a.nav-selected {
          background-color: rgba(0,123,255,0.2);
          border-color: #007bff;
        }
        
        .via-jovem-editor .sub-navigation li a:hover {
          background-color: rgba(0,123,255,0.1);
        }
        
        .via-jovem-editor .sub-navigation li a img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          display: block;
        }
        
        .via-jovem-editor .clothes-object {
          display: inline-block;
          width: 32px;
          height: 32px;
          margin: 2px;
          border: 2px solid transparent;
          border-radius: 4px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          text-decoration: none;
        }
        
        .via-jovem-editor .clothes-object:hover {
          border-color: #007bff;
          transform: scale(1.1);
        }
        
        .via-jovem-editor .clothes-object.selected {
          border-color: #28a745;
          background-color: rgba(40, 167, 69, 0.1);
        }
        
        .via-jovem-editor .clothes-object.club::after {
          content: "HC";
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ffc107;
          color: #000;
          font-size: 8px;
          font-weight: bold;
          padding: 1px 3px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .clothes-object.nft::after {
          content: "NFT";
          position: absolute;
          top: -5px;
          right: -5px;
          background: #6f42c1;
          color: #fff;
          font-size: 8px;
          font-weight: bold;
          padding: 1px 3px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .clothes-object.raro::after {
          content: "RARO";
          position: absolute;
          top: -5px;
          right: -8px;
          background: #dc3545;
          color: #fff;
          font-size: 7px;
          font-weight: bold;
          padding: 1px 2px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .clothes-object.sellable::after {
          content: "SELL";
          position: absolute;
          top: -5px;
          right: -8px;
          background: #17a2b8;
          color: #fff;
          font-size: 7px;
          font-weight: bold;
          padding: 1px 2px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .color-object {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin: 2px;
          border: 2px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .via-jovem-editor .color-object:hover {
          transform: scale(1.2);
          border-color: #007bff;
        }
        
        .via-jovem-editor .color-object.selected {
          border-color: #28a745;
          border-width: 3px;
        }
        
        .via-jovem-editor .color-object.colorClub {
          position: relative;
        }
        
        .via-jovem-editor .color-object.colorClub::after {
          content: "HC";
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ffc107;
          color: #000;
          font-size: 6px;
          font-weight: bold;
          padding: 1px 2px;
          border-radius: 2px;
          line-height: 1;
        }
        
        .via-jovem-editor .card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          max-height: 325px;
          max-width: 525px;
          overflow: auto;
        }
        
        .via-jovem-editor .card-body {
          padding: 15px;
        }
        
        .via-jovem-editor .pincel {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 10px 0;
        }
        
        .via-jovem-editor .pincel-body {
          padding: 15px;
        }
        
        .via-jovem-editor #search-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .via-jovem-editor .avatar-container {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .via-jovem-editor .avatar-container img {
          max-width: 200px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .via-jovem-editor .avatar-container img:hover {
          transform: scale(1.05);
        }
        
        .via-jovem-editor .user-search {
          display: flex;
          gap: 10px;
          margin: 10px 0;
          flex-wrap: wrap;
        }
        
        .via-jovem-editor .user-search input,
        .via-jovem-editor .user-search select {
          flex: 1;
          min-width: 150px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .via-jovem-editor .user-search button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .via-jovem-editor .user-search button:hover {
          background: #0056b3;
        }
        
        .via-jovem-editor .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 10px 0;
          justify-content: center;
        }
        
        .via-jovem-editor .action-buttons button {
          padding: 6px 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .via-jovem-editor .action-buttons button:hover {
          background: #1e7e34;
        }
        
        .via-jovem-editor .figure-display {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
          margin: 10px 0;
        }
        
        .via-jovem-editor .row {
          display: flex;
          flex-wrap: wrap;
          margin: 10px 0;
          gap: 20px;
        }
        
        .via-jovem-editor .row > div {
          flex: 1;
          min-width: 300px;
        }
        
        .via-jovem-editor .col-md-12 {
          width: 100%;
        }
        
        .via-jovem-editor .clothing-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .via-jovem-editor .color-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .via-jovem-editor .row {
            flex-direction: column;
          }
          
          .via-jovem-editor .main-navigation ul,
          .via-jovem-editor .sub-navigation ul {
            justify-content: center;
          }
          
          .via-jovem-editor .user-search {
            flex-direction: column;
          }
          
          .via-jovem-editor .user-search input,
          .via-jovem-editor .user-search select,
          .via-jovem-editor .user-search button {
            width: 100%;
            min-width: unset;
          }
        }
      `}</style>
      
      {/* Avatar Preview */}
      <div className="avatar-container">
        <img 
          src={getAvatarUrl()} 
          alt="Avatar Preview" 
          onClick={handleRotateAvatar}
          title="Clique para girar o avatar"
        />
        <div className="figure-display">
          {currentFigure}
        </div>
        <div className="action-buttons">
          <button onClick={copyFigure}>Copiar Figure</button>
          <button onClick={copyUrl}>Copiar URL</button>
          <button onClick={handleRotateAvatar}>Girar Avatar</button>
          <button onClick={randomizeAvatar}>Avatar Aleatório</button>
        </div>
      </div>

      {/* User Search & Hotel Selection */}
      <div className="user-search">
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite o nome do usuário"
          onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
        />
        <select 
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
        >
          <option value="habbohub">🌟 HabboHub</option>
          <option value="com.br">🇧🇷 Habbo Brasil</option>
          <option value="com">🌍 Habbo Internacional</option>
          <option value="es">🇪🇸 Habbo Espanha</option>
          <option value="de">🇩🇪 Habbo Alemanha</option>
          <option value="fr">🇫🇷 Habbo França</option>
        </select>
        <button onClick={handleSearchUser}>Buscar</button>
      </div>

      {/* Editor Interface */}
      <div className="row">
        <div className="col-md-6">
          <div className="main-navigation">
            <ul>
              <li>
                <a 
                  className={selectedCategory === 'hd' ? 'active' : ''}
                  onClick={() => handleCategoryClick('hd', 'gender')} 
                  href="#" 
                  title="Corpo/Rostos"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi0eQIgxrT5XIUhrroYSNGl8O2l5hj_OMJwFJdhyphenhyphenHytY29FVWsX3YlQ1u92d9imOiCOcfudwpgMyKj_X4X_FDlxlZTCn0F6pfjYor-1eercx4kBzw5qW_p_7yoCFL90oGV4PJxUmnBqcqCx/s0/1177__-3cy.png" alt="Corpo/Rostos" />
                </a>
              </li>
              <li>
                <a 
                  className={selectedCategory === 'hr' ? 'active' : ''}
                  onClick={() => handleCategoryClick('hr', 'hair')} 
                  href="#" 
                  title="Cabelos/Penteados"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNjUS-Ha0YYlJw4wrbDEmV7cVHeAhODwiDPXswujEf1ywhk77sLlWeGLn488mfHsFu0OZAksKuHyfej9_zAj0maCQUc-DGxrmyD62XHrhHfiCyfCXo6gaA1YY3MNqEPyrAyChH6OOpo7b1/s1600/Image+1175.png" alt="Cabelos" />
                </a>
              </li>
              <li>
                <a 
                  className={selectedCategory === 'ch' ? 'active' : ''}
                  onClick={() => handleCategoryClick('ch', 'tops')} 
                  href="#" 
                  title="Camisetas"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKIGt42L2O63iaFpagXgtTda1OBYtCHCdaTb7ZWdz1pQWvqC1AGW8dtMJqb-N-L_YYuuv-PnafgtIqrZYKNgJwRbRudBn6PRaGd-gTHJ88Y7k9VI2sp3c6LEOvjAnXJEGRhi33Lpoyk5Pg/s1600/Image+1871.png" alt="Camisetas" />
                </a>
              </li>
              <li>
                <a 
                  className={selectedCategory === 'lg' ? 'active' : ''}
                  onClick={() => handleCategoryClick('lg', 'bottoms')} 
                  href="#" 
                  title="Calças/Saias"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-JF8daD4mDOT9Yc2NYtZ48GwQfLlAtwTFNkVDC6zWph9MKicHCQzHWhYy4i0enyp1JtqX3J3PgKR9I1WH99LVVDKgVUEEUZw-4m6Un7jejkdy3ir47jiAjx_gNT-z5RXQXJYVDjQI6flr/s1600/Image+2113.png" alt="Calças" />
                </a>
              </li>
              <li>
                <a 
                  className={selectedCategory === 'sh' ? 'active' : ''}
                  onClick={() => handleCategoryClick('sh', 'shoes')} 
                  href="#" 
                  title="Sapatos"
                >
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVAY4sqXTjTiVZa4jRk7CGcoCyMTs5GY3NdG5u7ht7U5vQlPkpeMgaLiYXaQmtzpTn1S9gjCuvMfzS0cKOBPM6fAoPTmqGmsaKx43QZhehqsCKDOV2JNNeHzNVFLbvp0Z9BNNzI7bqh1yg/s1600/Tenis.png" alt="Sapatos" />
                </a>
              </li>
            </ul>
          </div>

          {/* Sub Navigation */}
          <div className="sub-navigation">
            {selectedSubNav === 'gender' && (
              <ul className="display">
                <li>
                  <a 
                    className={selectedGender === 'M' ? 'nav-selected' : ''}
                    onClick={() => handleGenderClick('M')} 
                    href="#" 
                    title="Masculino"
                  >
                    <img src="https://i.imgur.com/w5pMOoA.png" alt="Masculino" />
                  </a>
                </li>
                <li>
                  <a 
                    className={selectedGender === 'F' ? 'nav-selected' : ''}
                    onClick={() => handleGenderClick('F')} 
                    href="#" 
                    title="Feminino"
                  >
                    <img src="https://i.imgur.com/0KAtbUJ.png" alt="Feminino" />
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div className="card">
            <div className="card-body">
              <div id="clothes">
                <input 
                  type="text" 
                  id="search-input" 
                  placeholder="Buscar roupa..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="clothing-grid">
                  {filteredItems.map((item) => (
                    <a
                      key={item.id}
                      className={`clothes-object ${selectedCategory} ${item.rarity} ${selectedItem === item.id ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClothingClick(item.id);
                      }}
                      href="#"
                      title={item.name}
                      style={{
                        backgroundImage: `url("${getClothingImageUrl(selectedCategory, item.id, selectedColor)}")`
                      }}
                    ></a>
                  ))}
                </div>
                
                <div id="selected-clothing-name" style={{fontWeight: 'bold', marginTop: '10px'}}>
                  {filteredItems.find(item => item.id === selectedItem)?.name || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palettes */}
      <div className="row">
        <div className="col-md-12">
          <div className="pincel">
            <div className="pincel-body">
              <h4 style={{marginBottom: '10px'}}>Cores Básicas</h4>
              <div className="color-grid">
                {colorPalettes.nonhc.map((color) => (
                  <a
                    key={color.id}
                    href="#"
                    className={`color-object ${selectedColor === color.id ? 'selected' : ''}`}
                    style={{background: color.hex}}
                    onClick={(e) => {
                      e.preventDefault();
                      handleColorClick(color.id);
                    }}
                    title={color.name}
                  ></a>
                ))}
              </div>
              
              <h4 style={{marginBottom: '10px', marginTop: '20px'}}>Cores HC</h4>
              <div className="color-grid">
                {colorPalettes.hc.map((color) => (
                  <a
                    key={color.id}
                    href="#"
                    className={`color-object colorClub ${selectedColor === color.id ? 'selected' : ''}`}
                    style={{background: color.hex}}
                    onClick={(e) => {
                      e.preventDefault();
                      handleColorClick(color.id);
                    }}
                    title={color.name}
                  ></a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViaJovemEditor;