import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ViaJovemEditorExactProps {
  className?: string;
}

export const ViaJovemEditorExact = ({ className = '' }: ViaJovemEditorExactProps) => {
  const [currentFigure, setCurrentFigure] = useState('hd-190-7.hr-100-61.ch-210-66.lg-270-82.sh-305-62');
  const [selectedGender, setSelectedGender] = useState('M');
  const [selectedHotel, setSelectedHotel] = useState('habbohub');
  const [currentDirection, setCurrentDirection] = useState('2');
  const [selectedCategory, setSelectedCategory] = useState('hd');
  const [selectedSubNav, setSelectedSubNav] = useState('gender');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('7');
  const [selectedItem, setSelectedItem] = useState('190');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getAvatarUrl = () => {
    const hotel = selectedHotel === 'habbohub' ? 'www.habbo.com' : `www.habbo.${selectedHotel}`;
    return `https://${hotel}/habbo-imaging/avatarimage?figure=${currentFigure}&size=l&direction=${currentDirection}&head_direction=${currentDirection}&action=std&gesture=std&size=l`;
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
    
    // Hide all subnavs
    const subNavs = containerRef.current?.querySelectorAll('.sub-navigation ul');
    subNavs?.forEach(nav => nav.classList.add('hidden'));
    
    // Show selected subnav
    const targetNav = containerRef.current?.querySelector(`#${subnav}`);
    targetNav?.classList.remove('hidden');
    
    // Update active state
    const navItems = containerRef.current?.querySelectorAll('.main-navigation a');
    navItems?.forEach(item => item.classList.remove('active'));
    
    const activeItem = containerRef.current?.querySelector(`[data-navigate="${category}"]`);
    activeItem?.classList.add('active');
  };

  const handleGenderClick = (gender: string) => {
    setSelectedGender(gender);
    
    // Update gender visual state
    const genderItems = containerRef.current?.querySelectorAll('.sub-navigation [data-gender]');
    genderItems?.forEach(item => item.classList.remove('nav-selected'));
    
    const activeGender = containerRef.current?.querySelector(`[data-gender="${gender}"]`);
    activeGender?.classList.add('nav-selected');
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
    
    // Update visual selection
    const clothingItems = containerRef.current?.querySelectorAll('.clothes-object');
    clothingItems?.forEach(item => item.classList.remove('selected'));
    
    const selectedClothing = containerRef.current?.querySelector(`[data-clothing="${clothing}"]`);
    selectedClothing?.classList.add('selected');
  };

  const handleColorClick = (color: string, colorHex: string) => {
    setSelectedColor(color);
    
    // Update figure with new color
    const figureParts = currentFigure.split('.');
    const categoryPattern = new RegExp(`^${selectedCategory}-`);
    
    // Update existing category part with new color
    const updatedParts = figureParts.map(part => {
      if (categoryPattern.test(part)) {
        const [cat, item] = part.split('-');
        return `${cat}-${item}-${color}`;
      }
      return part;
    });
    
    setCurrentFigure(updatedParts.join('.'));
    
    // Update color visual selection
    const colorItems = containerRef.current?.querySelectorAll('.color-object');
    colorItems?.forEach(item => item.classList.remove('selected'));
    
    const selectedColorItem = containerRef.current?.querySelector(`[data-color="${colorHex}"]`);
    selectedColorItem?.classList.add('selected');
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

  useEffect(() => {
    if (!containerRef.current) return;

    // Add event listeners for navigation
    const navItems = containerRef.current.querySelectorAll('.main-navigation a[data-navigate]');
    navItems.forEach(item => {
      const element = item as HTMLElement;
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const category = element.getAttribute('data-navigate') || '';
        const subnav = element.getAttribute('data-subnav') || '';
        handleCategoryClick(category, subnav);
      });
    });

    // Add event listeners for gender
    const genderItems = containerRef.current.querySelectorAll('[data-gender]');
    genderItems.forEach(item => {
      const element = item as HTMLElement;
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const gender = element.getAttribute('data-gender') || '';
        handleGenderClick(gender);
      });
    });

    // Add event listeners for clothing
    const clothingItems = containerRef.current.querySelectorAll('.clothes-object[data-clothing]');
    clothingItems.forEach(item => {
      const element = item as HTMLElement;
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const clothing = element.getAttribute('data-clothing') || '';
        handleClothingClick(clothing);
      });
    });

    // Add event listeners for colors
    const colorItems = containerRef.current.querySelectorAll('.color-object[data-color]');
    colorItems.forEach(item => {
      const element = item as HTMLElement;
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const color = element.getAttribute('data-palette') || '';
        const colorHex = element.getAttribute('data-color') || '';
        handleColorClick(color, colorHex);
      });
    });

    return () => {
      // Cleanup event listeners
      navItems.forEach(item => {
        const element = item as HTMLElement;
        element.removeEventListener('click', () => {});
      });
    };
  }, [currentFigure, selectedCategory, selectedColor]);

  return (
    <div className={`via-jovem-editor ${className}`} ref={containerRef}>
      <style>{`
        :root {
          --submenu-bg: #f8f9fa;
        }
        
        .via-jovem-editor .col-md-6 {
          background-color: var(--submenu-bg);
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
        }
        
        .via-jovem-editor .main-navigation li a {
          display: block;
          padding: 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .via-jovem-editor .main-navigation li a.active {
          background-color: rgba(0,123,255,0.2);
        }
        
        .via-jovem-editor .main-navigation li a img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }
        
        .via-jovem-editor .sub-navigation ul {
          list-style: none;
          padding: 0;
          margin: 10px 0;
          display: flex;
          gap: 8px;
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
        }
        
        .via-jovem-editor .sub-navigation li a.nav-selected {
          background-color: rgba(0,123,255,0.2);
        }
        
        .via-jovem-editor .sub-navigation li a img {
          width: 24px;
          height: 24px;
          object-fit: contain;
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
        
        .via-jovem-editor .color-object {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin: 2px;
          border: 2px solid #ddd;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
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
        }
        
        .via-jovem-editor .user-search input {
          flex: 1;
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
        }
        
        .via-jovem-editor .user-search button:hover {
          background: #0056b3;
        }
        
        .via-jovem-editor .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 10px 0;
        }
        
        .via-jovem-editor .action-buttons button {
          padding: 6px 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
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
          margin: 10px 0;
        }
        
        .via-jovem-editor .col-md-12 {
          width: 100%;
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
        </div>
      </div>

      {/* User Search */}
      <div className="user-search">
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite o nome do usuário"
          onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
        />
        <button onClick={handleSearchUser}>Buscar</button>
      </div>

      {/* Hotel Selection */}
      <div className="user-search">
        <select 
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
          style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="habbohub">HabboHub</option>
          <option value="com.br">Habbo Brasil</option>
          <option value="com">Habbo Internacional</option>
          <option value="es">Habbo Espanha</option>
        </select>
      </div>

      {/* Editor Interface */}
      <div className="row">
        <div className="col-md-6">
          <div className="main-navigation">
            <ul>
              <li className="active">
                <a data-navigate="hd" data-subnav="gender" href="#" title="Corpo/Rostos">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi0eQIgxrT5XIUhrroYSNGl8O2l5hj_OMJwFJdhyphenhyphenHytY29FVWsX3YlQ1u92d9imOiCOcfudwpgMyKj_X4X_FDlxlZTCn0F6pfjYor-1eercx4kBzw5qW_p_7yoCFL90oGV4PJxUmnBqcqCx/s0/1177__-3cy.png" alt="Corpo/Rostos" />
                </a>
              </li>
              <li>
                <a data-navigate="hr" data-subnav="hair" href="#" title="Cabelos/Penteados">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNjUS-Ha0YYlJw4wrbDEmV7cVHeAhODwiDPXswujEf1ywhk77sLlWeGLn488mfHsFu0OZAksKuHyfej9_zAj0maCQUc-DGxrmyD62XHrhHfiCyfCXo6gaA1YY3MNqEPyrAyChH6OOpo7b1/s1600/Image+1175.png" alt="Cabelos" />
                </a>
              </li>
              <li>
                <a data-navigate="ch" data-subnav="tops" href="#" title="Camisetas">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKIGt42L2O63iaFpagXgtTda1OBYtCHCdaTb7ZWdz1pQWvqC1AGW8dtMJqb-N-L_YYuuv-PnafgtIqrZYKNgJwRbRudBn6PRaGd-gTHJ88Y7k9VI2sp3c6LEOvjAnXJEGRhi33Lpoyk5Pg/s1600/Image+1871.png" alt="Camisetas" />
                </a>
              </li>
              <li>
                <a data-navigate="lg" data-subnav="bottoms" href="#" title="Calças/Saias">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-JF8daD4mDOT9Yc2NYtZ48GwQfLlAtwTFNkVDC6zWph9MKicHCQzHWhYy4i0enyp1JtqX3J3PgKR9I1WH99LVVDKgVUEEUZw-4m6Un7jejkdy3ir47jiAjx_gNT-z5RXQXJYVDjQI6flr/s1600/Image+2113.png" alt="Calças" />
                </a>
              </li>
              <li>
                <a data-navigate="pt" data-subnav="more" href="#" style={{marginTop: '7px'}} title="Mais">
                  <img src="https://i.imgur.com/Zs1W1tp.png" alt="Mais" />
                </a>
              </li>
            </ul>
          </div>

          {/* Sub Navigation */}
          <div className="sub-navigation">
            <ul id="gender" className="display">
              <li>
                <a className="male nav-selected" data-gender="M" href="#" title="Masculino">
                  <img src="https://i.imgur.com/w5pMOoA.png" alt="Masculino" />
                </a>
              </li>
              <li>
                <a className="female" data-gender="F" href="#" title="Feminino">
                  <img src="https://i.imgur.com/0KAtbUJ.png" alt="Feminino" />
                </a>
              </li>
            </ul>
            
            <ul id="hair" className="hidden">
              <li>
                <a className="hair nav-selected" data-navigate="hr" href="#" title="Cabelos/Penteados">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgfNvHt2p9d0Lip0u0-iXWxYN19AdFvzgPJCpGzjAIBINOT7ZzTFWCZz4dmQSG54zyFJDH_12ZYNrEF0b2mYCFnDhzXjjEsBOMTI5D2q39RFka-kETXzYgJYRFItMl64HlZ26AbUsBBNVsA/s1600/Cabelo.png" alt="Cabelos" />
                </a>
              </li>
              <li>
                <a className="hats" data-navigate="ha" href="#" title="Chapéus">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg7yFD_Kt8WGjY8v3VcAY2Lzz9422x8nR7BcTiEe2BtxhAs67FqjfkEmTWOH1ufsfCHtin36EDgyi4uQfL5Zc_PboROpEac_cp7L6Fd0dpFPMhpBWoxhKGoVfC2-MX_BwAuzdgkpmAmWJdK/s1600/Bone2.png" alt="Chapéus" />
                </a>
              </li>
              <li>
                <a className="hair-accessories" data-navigate="he" href="#" title="Acessórios">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj2i207f8yNxhiqT4_L5tUQ0TU7sSJP-z3KTBBGSNygddPpsBpiAwOBSf639g4qJWUvc7c8OmY6ATDjkOtSo-7DjZcEwwgAU-rm-z7fsPSvnHp-x-_fEW8zw6sPIQ_FY9oA-HHXIYYzCLLs/s1600/AcessoriosCabelo.png" alt="Acessórios" />
                </a>
              </li>
              <li>
                <a className="glasses" data-navigate="ea" href="#" title="Óculos">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEheHbar2Ot5wW3kRtrh6W-YrKMPuFFLkyWdMfyvyU1tb6M2lkqULQilCLbFXNauI1Ttr14MjIFQ2zTKf0ZdYmSz8QfofjcIVqReVdvzwZQ_4UtZ-HpzxIsc7KuheYNda3RiCwrldsrhywuT/s1600/Oculos2.png" alt="Óculos" />
                </a>
              </li>
              <li>
                <a className="moustaches" data-navigate="fa" href="#" title="Máscaras">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPcKoHT8Z1IU-8g-Sd7TVKxLSumbU3oXwAQIMN9jPQ_SgOWT8WQ8LC8CGyGwDj-nzgKQk0_gj0ChyrIeKDUpn5cDoDsFYeH-Jwd7u2_FDxBmeeOvDDG_H3HDKmt4twBLs4o9gXfhV4QbjE/s1600/Rosto.png" alt="Máscaras" />
                </a>
              </li>
            </ul>
            
            <ul id="tops" className="hidden">
              <li>
                <a className="tops nav-selected" data-navigate="ch" href="#" title="Camisetas">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjYUPW4g_LstYQvULFNTorDIvmhpygKaHmGm8aZKr2aOPHP6FAEYABmvLvIviT6JpfDH4pE3U9xKrB9jKNFSsNlKOeRkzllSdnNIgcTeACeNI4Q7yuz0LFgjBPSevU9gAO6AwLOVlfmFMYq/s1600/Camiseta3.png" alt="Camisetas" />
                </a>
              </li>
              <li>
                <a className="chest" data-navigate="cp" href="#" title="Estampas">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYhz90sUhKrGhi_3KKYdveoKM_YA8Crx1hVXKtviJsMtpXuVdF5Ea6DhyphenhyphenAcUFjBTNNyKFKTePOy4l0wT9zZpsZJMsTNRuset8bRD4okPa1m9U0YPP64mP4SZG7z8DHSiSF7kYARUosNMih/s1600/Camiseta4.png" alt="Estampas" />
                </a>
              </li>
              <li>
                <a className="jackets" data-navigate="cc" href="#" title="Casacos/Vestidos">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiaurP6IOFPENN5MHbQzLVihAgSVltx0o3XjIGrgUIfVn_7C6XiYrIjywTYkn2qclSNOH7grncFiMuQWcqQ5Z9L-0KG4-O0awA8uuTgfCBb-WuaFInduqWaEQoV027YTVQzNQM7eWeo3TE_/s1600/Blusa.png" alt="Casacos" />
                </a>
              </li>
              <li>
                <a className="accessories" data-navigate="ca" href="#" title="Bijuteria">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEin93t94kk7Ml8b_uv5GxN5K7qvg7fA4w5cn4sleUzXuxUiz7ENsxXprhTADi2dBo1EBrCijfMqu64XjJrL6IvYTh_e3VfJgmTRLrbarW34go91Mu75Rf24FadEN8ZM8nd2b1QOkGPVGrJ0/s1600/Colar1.png" alt="Bijuteria" />
                </a>
              </li>
            </ul>
            
            <ul id="bottoms" className="hidden">
              <li>
                <a className="bottoms nav-selected" data-navigate="lg" href="#" title="Calças/Saias">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqNGxsRXCOvR-TDIg5cndm1vHQrKczbWQN69QsPo4MxoGMZnQP33oeKvekgwwjQtu3bKPjI3bqRULilKVxVwTuhgn9DFeU3HKZL8tRXIxfbUHuyjurxxfeAtqW0rTzKR7jH9SJOHwKz5FX/s1600/Calca1.png" alt="Calças" />
                </a>
              </li>
              <li>
                <a className="shoes" data-navigate="sh" href="#" title="Sapatos">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVAY4sqXTjTiVZa4jRk7CGcoCyMTs5GY3NdG5u7ht7U5vQlPkpeMgaLiYXaQmtzpTn1S9gjCuvMfzS0cKOBPM6fAoPTmqGmsaKx43QZhehqsCKDOV2JNNeHzNVFLbvp0Z9BNNzI7bqh1yg/s1600/Tenis.png" alt="Sapatos" />
                </a>
              </li>
              <li>
                <a className="belts" data-navigate="wa" href="#" title="Cintos">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmJytD2BdDq-o-RRtK60T-H-WG9mn3SzvFxBCfv6GsptBsRMfhUsIwIpqn5Fkq1OgV5yLvHFoR8ZD8ntYyzJ3TMmZpHApVjwiMcTfLnO2z9gb01Q44utis1tBiXSBYThFEqKd2-nMZBZEt/s1600/Cinto2.png" alt="Cintos" />
                </a>
              </li>
            </ul>
            
            <ul id="more" className="hidden">
              <li>
                <a className="pets nav-selected" data-navigate="pt" href="#" title="Pets">Pets</a>
              </li>
              <li>
                <a className="misc" data-navigate="mc" href="#" title="Misc">Diversos</a>
              </li>
            </ul>
          </div>

          <div className="card">
            <div className="card-body">
              <div id="clothes">
                <input type="text" id="search-input" placeholder="Buscar roupa..." />
                
                {/* Clothing Items - Sample data from ViaJovem */}
                <div id="hc">
                  <a className="clothes-object hd club" data-clothing="3091" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3091-7--&gender=M")'}}></a>
                  <a className="clothes-object hd club" data-clothing="3092" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3092-7--&gender=M")'}}></a>
                  <a className="clothes-object hd club" data-clothing="3093" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3093-7--&gender=M")'}}></a>
                  <a className="clothes-object hd club" data-clothing="3094" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3094-7--&gender=M")'}}></a>
                  <a className="clothes-object hd club" data-clothing="3095" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3095-7--&gender=M")'}}></a>
                </div>
                
                <div id="nonhc">
                  <a className="clothes-object hd" data-clothing="180" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-7--&gender=M")'}}></a>
                  <a className="clothes-object hd" data-clothing="185" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-185-7--&gender=M")'}}></a>
                  <a className="clothes-object hd selected" data-clothing="190" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-190-7--&gender=M")'}}></a>
                  <a className="clothes-object hd" data-clothing="195" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-195-7--&gender=M")'}}></a>
                  <a className="clothes-object hd" data-clothing="200" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-200-7--&gender=M")'}}></a>
                  <a className="clothes-object hd" data-clothing="205" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-205-7--&gender=M")'}}></a>
                  <a className="clothes-object hd" data-clothing="206" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-206-7--&gender=M")'}}></a>
                  <a className="clothes-object hd" data-clothing="207" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-207-7--&gender=M")'}}></a>
                  <a className="clothes-object hd" data-clothing="208" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-208-7--&gender=M")'}}></a>
                  <a className="clothes-object hd" data-clothing="209" href="#" title="Valor não encontrado" style={{backgroundImage: 'url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-209-7--&gender=M")'}}></a>
                </div>
                
                <div id="selected-clothing-name" style={{fontWeight: 'bold', marginTop: '10px'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palettes */}
      <div className="row">
        <div className="col-md-12" id="singleTone">
          <div className="pincel">
            <div className="pincel-body">
              <div id="colors">
                <div id="nonhc">
                  <a href="#" className="color-object" style={{background:'#F5DA88'}} data-palette="1" data-color="F5DA88"></a>
                  <a href="#" className="color-object" style={{background:'#FFDBC1'}} data-palette="1" data-color="FFDBC1"></a>
                  <a href="#" className="color-object" style={{background:'#FFCB98'}} data-palette="1" data-color="FFCB98"></a>
                  <a href="#" className="color-object" style={{background:'#F4AC54'}} data-palette="1" data-color="F4AC54"></a>
                  <a href="#" className="color-object" style={{background:'#FF987F'}} data-palette="1" data-color="FF987F"></a>
                  <a href="#" className="color-object" style={{background:'#e0a9a9'}} data-palette="1" data-color="e0a9a9"></a>
                  <a href="#" className="color-object" style={{background:'#ca8154'}} data-palette="1" data-color="ca8154"></a>
                  <a href="#" className="color-object" style={{background:'#B87560'}} data-palette="1" data-color="B87560"></a>
                  <a href="#" className="color-object" style={{background:'#9C543F'}} data-palette="1" data-color="9C543F"></a>
                  <a href="#" className="color-object" style={{background:'#904925'}} data-palette="1" data-color="904925"></a>
                  <a href="#" className="color-object" style={{background:'#4C311E'}} data-palette="1" data-color="4C311E"></a>
                </div>
                <div id="hc">
                  <a href="#" className="color-object colorClub" style={{background:'#543d35'}} data-palette="1" data-color="543d35"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#653a1d'}} data-palette="1" data-color="653a1d"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#6E392C'}} data-palette="1" data-color="6E392C"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#714947'}} data-palette="1" data-color="714947"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#856860'}} data-palette="1" data-color="856860"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#895048'}} data-palette="1" data-color="895048"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#a15253'}} data-palette="1" data-color="a15253"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#aa7870'}} data-palette="1" data-color="aa7870"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#be8263'}} data-palette="1" data-color="be8263"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#b6856d'}} data-palette="1" data-color="b6856d"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#ba8a82'}} data-palette="1" data-color="ba8a82"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#c88f82'}} data-palette="1" data-color="c88f82"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#d9a792'}} data-palette="1" data-color="d9a792"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#c68383'}} data-palette="1" data-color="c68383"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#BC576A'}} data-palette="1" data-color="BC576A"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#FF5757'}} data-palette="1" data-color="FF5757"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#FF7575'}} data-palette="1" data-color="FF7575"></a>
                  <a href="#" className="color-object colorClub" style={{background:'#B65E38'}} data-palette="1" data-color="B65E38"></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        {/* Avatar Preview Column */}
        <div className="col-md-6">
          <div className="avatar-container">
            <img 
              src={getAvatarUrl()} 
              alt="Avatar Preview"
              onClick={handleRotateAvatar}
              title="Clique para rotacionar"
            />
          </div>
          
          <div className="user-search">
            <input
              type="text"
              placeholder="Nome do usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
            />
            <button onClick={handleSearchUser}>Buscar</button>
          </div>
          
          <div className="action-buttons">
            <button onClick={copyFigure}>Copiar Visual</button>
            <button onClick={copyUrl}>Copiar URL</button>
            <button onClick={handleRotateAvatar}>Rotacionar</button>
          </div>
          
          <div className="figure-display">
            <strong>Visual:</strong> {currentFigure}
          </div>
        </div>

        {/* Editor Column */}
        <div className="col-md-6" style={{ backgroundColor: 'var(--submenu-bg)', padding: '20px', borderRadius: '5px' }}>
          <div className="main-navigation">
            <ul>
              <li className="active">
                <a data-navigate="hd" data-subnav="gender" href="#" title="Corpo/Rostos">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi0eQIgxrT5XIUhrroYSNGl8O2l5hj_OMJwFJdhyphenhyphenHytY29FVWsX3YlQ1u92d9imOiCOcfudwpgMyKj_X4X_FDlxlZTCn0F6pfjYor-1eercx4kBzw5qW_p_7yoCFL90oGV4PJxUmnBqcqCx/s0/1177__-3cy.png" />
                </a>
              </li>
              <li>
                <a data-navigate="hr" data-subnav="hair" href="#" title="Cabelos/Penteados">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNjUS-Ha0YYlJw4wrbDEmV7cVHeAhODwiDPXswujEf1ywhk77sLlWeGLn488mfHsFu0OZAksKuHyfej9_zAj0maCQUc-DGxrmyD62XHrhHfiCyfCXo6gaA1YY3MNqEPyrAyChH6OOpo7b1/s1600/Image+1175.png" />
                </a>
              </li>
              <li>
                <a data-navigate="ch" data-subnav="tops" href="#" title="Camisetas">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKIGt42L2O63iaFpagXgtTda1OBYtCHCdaTb7ZWdz1pQWvqC1AGW8dtMJqb-N-L_YYuuv-PnafgtIqrZYKNgJwRbRudBn6PRaGd-gTHJ88Y7k9VI2sp3c6LEOvjAnXJEGRhi33Lpoyk5Pg/s1600/Image+1871.png" />
                </a>
              </li>
              <li>
                <a data-navigate="lg" data-subnav="bottoms" href="#" title="Calças/Saias">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-JF8daD4mDOT9Yc2NYtZ48GwQfLlAtwTFNkVDC6zWph9MKicHCQzHWhYy4i0enyp1JtqX3J3PgKR9I1WH99LVVDKgVUEEUZw-4m6Un7jejkdy3ir47jiAjx_gNT-z5RXQXJYVDjQI6flr/s1600/Image+2113.png" />
                </a>
              </li>
              <li>
                <a data-navigate="pt" data-subnav="more" href="#" style={{ marginTop: '7px' }} title="Mais">
                  <img src="https://i.imgur.com/Zs1W1tp.png" />
                </a>
              </li>
            </ul>
          </div>

          {/* Sub Navigation */}
          <div className="sub-navigation">
            <ul id="gender" className="display">
              <li>
                <a className="male nav-selected" data-gender="M" href="#" title="Masculino">
                  <img src="https://i.imgur.com/w5pMOoA.png" />
                </a>
              </li>
              <li>
                <a className="female" data-gender="F" href="#" title="Feminino">
                  <img src="https://i.imgur.com/0KAtbUJ.png" />
                </a>
              </li>
            </ul>
            
            <ul id="hair" className="hidden">
              <li>
                <a className="hair nav-selected" data-navigate="hr" href="#" title="Cabelos/Penteados">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgfNvHt2p9d0Lip0u0-iXWxYN19AdFvzgPJCpGzjAIBINOT7ZzTFWCZz4dmQSG54zyFJDH_12ZYNrEF0b2mYCFnDhzXjjEsBOMTI5D2q39RFka-kETXzYgJYRFItMl64HlZ26AbUsBBNVsA/s1600/Cabelo.png" />
                </a>
              </li>
              <li>
                <a className="hats" data-navigate="ha" href="#" title="Chapéus">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg7yFD_Kt8WGjY8v3VcAY2Lzz9422x8nR7BcTiEe2BtxhAs67FqjfkEmTWOH1ufsfCHtin36EDgyi4uQfL5Zc_PboROpEac_cp7L6Fd0dpFPMhpBWoxhKGoVfC2-MX_BwAuzdgkpmAmWJdK/s1600/Bone2.png" />
                </a>
              </li>
            </ul>
            
            <ul id="tops" className="hidden">
              <li>
                <a className="tops nav-selected" data-navigate="ch" href="#" title="Camisetas">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjYUPW4g_LstYQvULFNTorDIvmhpygKaHmGm8aZKr2aOPHP6FAEYABmvLvIviT6JpfDH4pE3U9xKrB9jKNFSsNlKOeRkzllSdnNIgcTeACeNI4Q7yuz0LFgjBPSevU9gAO6AwLOVlfmFMYq/s1600/Camiseta3.png" />
                </a>
              </li>
            </ul>
            
            <ul id="bottoms" className="hidden">
              <li>
                <a className="bottoms nav-selected" data-navigate="lg" href="#" title="Calças/Saias">
                  <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqNGxsRXCOvR-TDIg5cndm1vHQrKczbWQN69QsPo4MxoGMZnQP33oeKvekgwjQtu3bKPjI3bqRULilKVxVwTuhgn9DFeU3HKZL8tRXIxfbUHuyjurxxfeAtqW0rTzKR7jH9SJOHwKz5FX/s1600/Calca1.png" />
                </a>
              </li>
            </ul>
            
            <ul id="more" className="hidden">
              <li>
                <a className="pets nav-selected" data-navigate="pt" href="#" title="Pets">Pets</a>
              </li>
            </ul>
          </div>

          <div className="card" style={{ maxHeight: '325px', maxWidth: '525px', overflow: 'auto' }}>
            <div className="card-body">
              <div id="clothes">
                <input type="text" id="search-input" placeholder="Buscar roupa..." />
                
                <div id="hc">
                  <a className="clothes-object hd club" data-clothing="3091" href="#" title="HC Head 3091" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3091-7--&gender=M")` }}></a>
                  <a className="clothes-object hd club" data-clothing="3092" href="#" title="HC Head 3092" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3092-7--&gender=M")` }}></a>
                </div>
                
                <div id="nft">
                  <a className="clothes-object hd nft" data-clothing="4202" href="#" title="NFT Head 4202" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-4202-7--&gender=M")` }}></a>
                  <a className="clothes-object hd nft" data-clothing="5041" href="#" title="Rosto de Boneca" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-5041-7--&gender=M")` }}></a>
                </div>
                
                <div id="raro">
                  <a className="clothes-object hd raro" data-clothing="3536" href="#" title="Cara de Gato Demoníaco" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3536-7--&gender=M")` }}></a>
                  <a className="clothes-object hd raro" data-clothing="3537" href="#" title="Olho do Ciclope" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-3537-7--&gender=M")` }}></a>
                </div>
                
                <div id="nonhc">
                  <a className="clothes-object hd" data-clothing="180" href="#" title="Head 180" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-7--&gender=M")` }}></a>
                  <a className="clothes-object hd" data-clothing="185" href="#" title="Head 185" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-185-7--&gender=M")` }}></a>
                  <a className="clothes-object hd selected" data-clothing="190" href="#" title="Head 190" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-190-7--&gender=M")` }}></a>
                  <a className="clothes-object hd" data-clothing="195" href="#" title="Head 195" style={{ backgroundImage: `url("https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-195-7--&gender=M")` }}></a>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12" id="singleTone">
              <div className="pincel">
                <div className="pincel-body">
                  <div id="colors">
                    <div id="nonhc">
                      <a href="#" className="color-object" style={{ background: '#F5DA88' }} data-palette="1" data-color="F5DA88"></a>
                      <a href="#" className="color-object" style={{ background: '#FFDBC1' }} data-palette="2" data-color="FFDBC1"></a>
                      <a href="#" className="color-object" style={{ background: '#FFCB98' }} data-palette="3" data-color="FFCB98"></a>
                      <a href="#" className="color-object" style={{ background: '#F4AC54' }} data-palette="4" data-color="F4AC54"></a>
                      <a href="#" className="color-object" style={{ background: '#FF987F' }} data-palette="5" data-color="FF987F"></a>
                      <a href="#" className="color-object" style={{ background: '#e0a9a9' }} data-palette="6" data-color="e0a9a9"></a>
                      <a href="#" className="color-object selected" style={{ background: '#ca8154' }} data-palette="7" data-color="ca8154"></a>
                    </div>
                    
                    <div id="hc">
                      <a href="#" className="color-object colorClub" style={{ background: '#543d35' }} data-palette="8" data-color="543d35"></a>
                      <a href="#" className="color-object colorClub" style={{ background: '#653a1d' }} data-palette="9" data-color="653a1d"></a>
                      <a href="#" className="color-object colorClub" style={{ background: '#6E392C' }} data-palette="10" data-color="6E392C"></a>
                      <a href="#" className="color-object colorClub" style={{ background: '#714947' }} data-palette="11" data-color="714947"></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};