
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ClothingMenu from './ClothingMenu';

// Função auxiliar para construir a URL do Habbo Imaging
const buildHabboImageUrl = (
  hotel: string,
  user: string,
  look: string,
  gender: 'M' | 'F',
  gesture: string,
  action: string,
  body2: string,
  left: string,
  right: string,
  sign: string,
  object: string,
  size: string = 'l',
  direction: number = 2,
  headDirection: number = 3
) => {
  const baseUrl = `https://www.${hotel}/habbo-imaging/avatarimage`;
  const params = [
    `size=${size}`,
    `direction=${direction}`,
    `head_direction=${headDirection}`,
    `img_format=png`,
    `gesture=${gesture}`,
    `frame=0`,
    `headonly=0`,
    `gender=${gender}`,
  ];

  // Adiciona o parâmetro 'figure' (look) se ele existir e não estiver vazio
  if (look) params.push(`figure=${look}`);
  if (action) params.push(`action=${action}`);
  if (body2) params.push(`action_a=${body2}`);
  if (left) params.push(`action_b=${left}`);
  if (right) params.push(`action_c=${right}`);
  if (sign) params.push(`sign=${sign}`);
  if (object) params.push(`item=${object}`);
  if (user) params.push(`user=${user}`);

  return `${baseUrl}?${params.join('&')}`;
};

export const AvatarEditor = () => {
  const [selectedHotel, setSelectedHotel] = useState('habbo.com.br');
  const [username, setUsername] = useState('HabboHotel');

  // Looks padrão para masculino e feminino no formato correto do Habbo
  const defaultMaleLook = 'hd-180-22.hr-828-61-undefined.ch-255-110-92.lg-275-1408-undefined.sh-908-1408-undefined';
  const defaultFemaleLook = 'hd-600-1.hr-700-42-undefined.ch-800-90.lg-900-10.sh-100-20';

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
  
  // Novos estados para controles do HabboNews
  const [avatarSize, setAvatarSize] = useState('l'); // s, n, l
  const [direction, setDirection] = useState(2); // 0-7
  const [headDirection, setHeadDirection] = useState(3);

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
      gender,
      gesture,
      action,
      bodyAction,
      leftHand,
      rightHand,
      sign,
      handItem,
      avatarSize,
      direction,
      headDirection
    );
    setAvatarUrl(newUrl);
  }, [selectedHotel, username, look, gender, gesture, action, bodyAction, leftHand, rightHand, sign, handItem, avatarSize, direction, headDirection]);

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

  const rotateAvatar = (direction: 'left' | 'right') => {
    setDirection(prev => {
      if (direction === 'left') {
        return prev === 0 ? 7 : prev - 1;
      } else {
        return prev === 7 ? 0 : prev + 1;
      }
    });
  };

  const handleSizeChange = (size: 's' | 'n' | 'l') => {
    setAvatarSize(size);
  };

  const handItems = [
    { id: '', name: 'Nenhum', image: 'https://i.imgur.com/l99IY2D.png' },
    { id: '1', name: 'Leite', image: 'https://i.imgur.com/Z9sk1U9.png' },
    { id: '2', name: 'Cenoura', image: 'https://i.imgur.com/ngn0r0i.png' },
    { id: '3', name: 'Sorvete', image: 'https://i.imgur.com/ZEVZP7D.png' },
    { id: '5', name: 'Suco Bubblejuice', image: 'https://i.imgur.com/LGA9lXe.png' },
    { id: '6', name: 'Café', image: 'https://i.imgur.com/NEJdIXf.png' },
    { id: '9', name: 'Poção', image: 'https://i.imgur.com/1DLtDul.png' },
    { id: '76', name: 'Rosa', image: 'https://i.imgur.com/rUKlvLD.png' },
    { id: '77', name: 'Rosa negra', image: 'https://i.imgur.com/dbKCkvN.png' },
  ];

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        {/* Coluna da Esquerda: Avatar Display */}
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

          {/* Avatar Display com Controles de Rotação */}
          <div className="relative">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white min-h-[250px] flex items-center justify-center relative">
              <img 
                alt="Prévia do Habbo" 
                src={avatarUrl}
                style={{ imageRendering: 'pixelated' }}
                className="max-w-full h-auto"
                onError={() => {
                  toast.error('Erro ao carregar avatar. Verifique se o usuário existe.');
                }}
              />
              
              {/* Botões de Rotação */}
              <button
                onClick={() => rotateAvatar('left')}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                title="Rotacionar para esquerda"
              >
                ←
              </button>
              <button
                onClick={() => rotateAvatar('right')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                title="Rotacionar para direita"
              >
                →
              </button>
            </div>
          </div>

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
        </div>

        {/* Coluna do Meio - Controles de Avatar */}
        <div className="flex flex-col space-y-4">
          {/* Controle de Tamanho */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">📏</span>Tamanho
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSizeChange('s')}
                className={`px-3 py-2 rounded ${avatarSize === 's' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
              >
                MINI
              </button>
              <button
                onClick={() => handleSizeChange('n')}
                className={`px-3 py-2 rounded ${avatarSize === 'n' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
              >
                ×1
              </button>
              <button
                onClick={() => handleSizeChange('l')}
                className={`px-3 py-2 rounded ${avatarSize === 'l' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
              >
                ×2
              </button>
            </div>
          </div>

          {/* Gestos */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">😊</span>Gestos
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'std', icon: '😐', title: 'Normal' },
                { value: 'spk', icon: '🗣️', title: 'Falando' },
                { value: 'sml', icon: '😊', title: 'Sorrindo' },
                { value: 'srp', icon: '😲', title: 'Surpreso' },
                { value: 'agr', icon: '😠', title: 'Nervoso' },
                { value: 'sad', icon: '😢', title: 'Triste' },
                { value: 'blw', icon: '😘', title: 'Beijo' },
                { value: 'eyb', icon: '😴', title: 'Dormindo' }
              ].map(gest => (
                <button
                  key={gest.value}
                  onClick={() => setGesture(gest.value)}
                  className={`p-2 rounded text-lg ${gesture === gest.value ? 'bg-blue-500 text-white' : 'bg-white border'}`}
                  title={gest.title}
                >
                  {gest.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Items de Mão */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">🤚</span>Item de Mão
            </div>
            <select
              className="w-full p-2 border rounded-lg bg-white"
              value={handItem}
              onChange={(e) => setHandItem(e.target.value)}
            >
              {handItems.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          {/* Ações */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">🎭</span>Ações
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: '', icon: '🧍', title: 'Parado' },
                { value: 'std', icon: '🚶', title: 'Normal' },
                { value: 'lay', icon: '🛌', title: 'Deitado' },
                { value: 'sit', icon: '🪑', title: 'Sentado' },
                { value: 'wlk', icon: '🏃', title: 'Andando' },
                { value: 'wav', icon: '👋', title: 'Acenando' }
              ].map(act => (
                <button
                  key={act.value}
                  onClick={() => setAction(act.value)}
                  className={`p-2 rounded text-sm ${action === act.value ? 'bg-blue-500 text-white' : 'bg-white border'}`}
                  title={act.title}
                >
                  {act.icon} {act.title}
                </button>
              ))}
            </div>
          </div>

          {/* Sinais */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">🔢</span>Sinais
            </div>
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

          {/* URL Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-2">URL do Avatar:</div>
            <input
              type="text"
              value={avatarUrl}
              readOnly
              className="w-full text-xs bg-gray-100 p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Coluna da Direita - Menu de Roupas */}
        <div className="flex flex-col space-y-4">
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
