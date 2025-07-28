
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ClothingMenu from './ClothingMenu';

// Função auxiliar para construir a URL do Habbo Imaging
const buildHabboImageUrl = (
  hotel: string,
  user: string,
  look: string,
  gender: 'M' | 'F', // Adiciona gender aqui, é importante para o avatar!
  gesture: string,
  action: string,
  body2: string,
  left: string,
  right: string,
  sign: string,
  object: string
) => {
  const baseUrl = `https://www.${hotel}/habbo-imaging/avatarimage?user=${user}`;
  const params = [
    `direction=2`,
    `head_direction=3`,
    `img_format=png`,
    `gesture=${gesture}`,
    `frame=0`,
    `headonly=0`,
    `size=m`,
    `gender=${gender}`, // Incluir o gênero aqui
  ];

  // Adiciona o parâmetro 'figure' (look) se ele existir e não estiver vazio
  if (look) params.push(`figure=${look}`);
  if (action) params.push(`action=${action}`);
  if (body2) params.push(`action_a=${body2}`);
  if (left) params.push(`action_b=${left}`);
  if (right) params.push(`action_c=${right}`);
  if (sign) params.push(`sign=${sign}`);
  if (object) params.push(`item=${object}`);

  return `${baseUrl}&${params.join('&')}`;
};

export const AvatarEditor = () => {
  const [selectedHotel, setSelectedHotel] = useState('habbo.com.br');
  const [username, setUsername] = useState('HabboHotel');

  // Looks padrão para masculino e feminino
  const defaultMaleLook = 'hd-180-7.hr-828-45.ch-3006-82-62.lg-275-82.sh-3059-82.ha-1002-82';
  const defaultFemaleLook = 'hd-600-1.hr-700-42.ch-800-90.lg-900-10.sh-100-20.ha-101-30';

  const [gender, setGender] = useState<'M' | 'F'>('F'); // Inicia com Feminino
  const [look, setLook] = useState(defaultFemaleLook); // Look inicial é o feminino

  const [gesture, setGesture] = useState('std');
  const [action, setAction] = useState('');
  const [bodyAction, setBodyAction] = useState('');
  const [leftHand, setLeftHand] = useState('');
  const [rightHand, setRightHand] = useState('');
  const [sign, setSign] = useState('');
  const [handItem, setHandItem] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const categories = [
    { id: 'gender', name: 'Gênero' },
    { id: 'hair', name: 'Cabelo' },
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'more', name: 'Mais' }
  ];

  // Efeito para atualizar a URL do avatar sempre que um dos estados muda
  useEffect(() => {
    const newUrl = buildHabboImageUrl(
      selectedHotel,
      username,
      look,
      gender, // Passa o gênero para a construção da URL
      gesture,
      action,
      bodyAction,
      leftHand,
      rightHand,
      sign,
      handItem
    );
    setAvatarUrl(newUrl);
  }, [selectedHotel, username, look, gender, gesture, action, bodyAction, leftHand, rightHand, sign, handItem]); // Adiciona gender como dependência

  const updateAvatar = () => {
    toast.success('Avatar atualizado!');
  };

  const copyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(avatarUrl);
      toast.success('URL copiada para a área de transferência!');
    } catch (err) {
      toast.error('Erro ao copiar URL');
    }
  };

  const handleLookChangeFromMenu = (newLook: string) => {
    setLook(newLook);
  };

  const handleGenderChangeFromMenu = (newGender: 'M' | 'F') => {
    setGender(newGender);
    if (newGender === 'M') {
      setLook(defaultMaleLook);
    } else {
      setLook(defaultFemaleLook);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta sobre o perfil público */}
      <div className="bg-yellow-400 text-black text-center p-4 font-bold text-base shadow-md flex items-center justify-center rounded">
        <img 
          alt="Alerta de perfil público" 
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhWrb7Gas1E-jwzvprJVG1JIguUMz0ZuSbk7VqzQ5kSqG8U4eo0s6z1HG1BpAXZuzExGHUL0M2-Dr8kA4McEGg6S7FnKupjQa0zEU4FreAOoDyjp/s0/2190__-5kz.png" 
          className="w-8 h-8 mr-3"
        />
        <span>
          O perfil do jogador precisa estar público para o uso da ferramenta. 
          Caso algum bug com a figura se apresente, utilize os frames para ajustar ou rotacione seu avatar.
        </span>
      </div>

      {/* Contêiner Principal do Gerador de Imagem e Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        {/* Coluna da Esquerda: Imagem do Habbo e Hotel Selector */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full">
            <div className="text-sm font-medium mb-2">Hotel:</div>
            <select 
              className="w-full p-2 border rounded-lg bg-white"
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
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
          
          <a href={avatarUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white min-h-[200px] flex items-center justify-center">
              <img 
                alt="Prévia do Habbo" 
                src={avatarUrl}
                style={{ imageRendering: 'pixelated' }}
                className="max-w-full h-auto"
                onError={() => {
                  toast.error('Erro ao carregar avatar. Verifique se o usuário existe.');
                }}
              />
            </div>
          </a>

          <div className="w-full">
            <div className="text-sm font-medium mb-2">Usuário:</div>
          <input
            placeholder="HabboHotel" 
            type="text"
            className="w-full p-2 border rounded-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          </div>
          
          <button onClick={updateAvatar} className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium">
            Atualizar Avatar
          </button>
          <button onClick={copyImageUrl} className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium">
            Copiar URL da Imagem
          </button>
          <input
            type="text"
            value={avatarUrl}
            readOnly
            className="w-full text-center text-sm bg-gray-100 p-2 border rounded-lg"
          />
        </div>

        {/* Coluna da Direita - Controles de Avatar e o NOVO MENU DE ROUPAS */}
        <div className="flex flex-col space-y-4">
          {/* Seletor de Gestos */}
          <div>
            <div className="text-sm font-medium mb-2">Gestos:</div>
            <select
              className="w-full p-2 border rounded-lg bg-white"
              value={gesture}
              onChange={(e) => setGesture(e.target.value)}
            >
              <option value="std">Normal</option>
              <option value="spk">Falando</option>
              <option value="sml">Sorrindo</option>
              <option value="srp">Surpreso</option>
              <option value="agr">Nervoso</option>
              <option value="sad">Triste</option>
              <option value="blw">Beijo</option>
              <option value="eyb">Dormindo</option>
            </select>
          </div>

          {/* Seletor de Ação no Corpo */}
          <div>
            <div className="text-sm font-medium mb-2">Ação no corpo:</div>
            <select
              className="w-full p-2 border rounded-lg bg-white"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="">Nada</option>
              <option value="std">Normal</option>
              <option value="lay">Dormindo</option>
              <option value="wlk">Andando (Animado)</option>
            </select>
          </div>

          {/* Seletor de Corpo2 */}
          <div>
            <div className="text-sm font-medium mb-2">Corpo2:</div>
            <select
              className="w-full p-2 border rounded-lg bg-white"
              value={bodyAction}
              onChange={(e) => setBodyAction(e.target.value)}
            >
              <option value="">Nada</option>
              <option value="sit">Sentado</option>
            </select>
          </div>

          {/* Seletor de Esquerda */}
          <div>
            <div className="text-sm font-medium mb-2">Esquerda:</div>
            <select
              className="w-full p-2 border rounded-lg bg-white"
              value={leftHand}
              onChange={(e) => setLeftHand(e.target.value)}
            >
              <option value="">Nada</option>
              <option value="respect">Respeito</option>
              <option value="wav">Acenando (Animado)</option>
            </select>
          </div>

          {/* Seletor de Direita */}
          <div>
            <div className="text-sm font-medium mb-2">Direita:</div>
            <select
              className="w-full p-2 border rounded-lg bg-white"
              value={rightHand}
              onChange={(e) => setRightHand(e.target.value)}
            >
              <option value="">Nada</option>
              <option value="crr">Mão esticada</option>
              <option value="drk">Mão na boca</option>
              <option value="blw">Mandando beijo</option>
            </select>
          </div>

          {/* Seletor de Sinais */}
          <div>
            <div className="text-sm font-medium mb-2">Sinais:</div>
            <select
              className="w-full p-2 border rounded-lg bg-white"
              value={sign}
              onChange={(e) => setSign(e.target.value)}
            >
              <option value="">Normal</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">Coração</option>
              <option value="12">Caveira</option>
              <option value="13">Exclamação</option>
              <option value="14">Bola de Futebol</option>
              <option value="15">Cara Feliz</option>
              <option value="16">Cartão Vermelho</option>
              <option value="17">Cartão Amarelo</option>
              <option value="18">Nada (Imaginário)</option>
            </select>
          </div>

          {/* Seletor de Objeto */}
          <div>
            <div className="text-sm font-medium mb-2">Objeto:</div>
            <select
              className="w-full p-2 border rounded-lg bg-white max-h-32 overflow-y-auto"
              value={handItem}
              onChange={(e) => setHandItem(e.target.value)}
            >
              <option value="">Nenhum</option>
              <option value="1">Leite</option>
              <option value="2">Cenoura</option>
              <option value="3">Sorvete de Baunilha</option>
              <option value="5">Suco Bubblejuice</option>
              <option value="76">Rosa</option>
              <option value="77">Rosa negra</option>
              <option value="102">Presente</option>
              <option value="256">Bola de Futebol</option>
            </select>
          </div>

          {/* Renderiza o componente ClothingMenu */}
          <ClothingMenu
            currentLook={look}
            onLookChange={handleLookChangeFromMenu}
            onGenderChange={handleGenderChangeFromMenu}
            currentGender={gender}
          />
        </div>
      </div>

    </div>
  );
};
