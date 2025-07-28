// src/components/AvatarEditor.tsx
import React, { useState, useEffect } from 'react';
import ClothingMenu from './ClothingMenu';
import { getHabboColorId } from '../data/clothingItems';

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
  object: string
) => {
  const baseUrl = `https://www.${hotel}/habbo-imaging/avatarimage?user=${user}`;
  const params = [
    `action=${action}`,
    `direction=2`,
    `head_direction=3`,
    `img_format=png`,
    `gesture=${gesture}`,
    `frame=0`,
    `headonly=0`,
    `size=m`,
    `gender=${gender}`,
  ];

  if (look) params.push(`figure=${look}`);

  if (body2) params.push(`action_a=${body2}`);
  if (left) params.push(`action_b=${left}`);
  if (right) params.push(`action_c=${right}`);
  if (sign) params.push(`sign=${sign}`);
  if (object) params.push(`item=${object}`);

  return `${baseUrl}&${params.join('&')}`;
};

const AvatarEditor: React.FC = () => {
  const [hotel, setHotel] = useState('habbo.com.br');
  const [username, setUsername] = useState('HabboHotel');

  // Looks padrão usando IDs numéricos de cor mapeados do nosso HABBO_COLOR_MAP
  // Estes looks são baseados nos seus exemplos e tentam usar cores que existem no HABBO_COLOR_MAP
  const defaultMaleLook = `hd-180-${getHabboColorId('000000')}-.hr-678-${getHabboColorId('000000')}-${getHabboColorId('828282')}.ch-3006-${getHabboColorId('000000')}-${getHabboColorId('828282')}.lg-275-${getHabboColorId('000000')}-.sh-3059-${getHabboColorId('000000')}-.ha-1002-${getHabboColorId('000000')}-`;
  // Para o look feminino, usei o cabelo hr-5773 (que tem colorSlots:2) e outras peças com cores padrão.
  const defaultFemaleLook = `hd-600-${getHabboColorId('000000')}-.hr-5773-${getHabboColorId('000000')}-${getHabboColorId('828282')}.ch-800-${getHabboColorId('000000')}-.lg-900-${getHabboColorId('000000')}-.sh-100-${getHabboColorId('000000')}-.ha-101-${getHabboColorId('000000')}-`;


  const [gender, setGender] = useState<'M' | 'F'>('F');
  const [look, setLook] = useState(defaultFemaleLook);

  const [gesture, setGesture] = useState('std');
  const [action, setAction] = useState('');
  const [body2, setBody2] = useState('');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [sign, setSign] = useState('');
  const [object, setObject] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const newUrl = buildHabboImageUrl(
      hotel,
      username,
      look,
      gender,
      gesture,
      action,
      body2,
      left,
      right,
      sign,
      object
    );
    setAvatarUrl(newUrl);
  }, [hotel, username, look, gender, gesture, action, body2, left, right, sign, object]);

  const handleHotelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHotel(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleGestureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGesture(e.target.value);
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAction(e.target.value);
  };

  const handleBody2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBody2(e.target.value);
  };

  const handleLeftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLeft(e.target.value);
  };

  const handleRightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRight(e.target.value);
  };

  const handleSignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSign(e.target.value);
  };

  const handleObjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setObject(e.target.value);
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
      <div className="bg-yellow-400 text-black text-center p-4 font-bold text-base shadow-md flex items-center justify-center rounded">
        <img alt="Alerta de perfil público" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhWrb7Gas1E-jwzvprJVG1JIguUMz0ZuSbk7VqzQ5kSqG8U4eo0s6z1HG1BpAXZuzExGHUL0M2-Dr8kA4McEGg6S7FnKupjQa0zEU4FreAOoDyjp/s0/2190__-5kz.png" className="w-8 h-8 mr-3" />
        <span>O perfil do jogador precisa estar público para o uso da ferramenta. Caso algum bug com a figura se apresente, utilize os frames para ajustar ou rotacione seu avatar.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full">
            <div className="text-sm font-medium mb-2">Hotel:</div>
            <select className="w-full p-2 border rounded-lg bg-white" value={hotel} onChange={handleHotelChange}>
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
                className="max-w-full h-auto"
                style={{ imageRendering: 'pixelated' }}
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
              onChange={handleUsernameChange}
            />
          </div>

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium"
            onClick={() => alert('Avatar atualizado (automático via seleção)!')}
          >
            Atualizar Avatar
          </button>

          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium"
            onClick={handleCopyUrl}
          >
            Copiar URL da Imagem
          </button>

          <input
            type="text"
            readOnly
            className="w-full text-center text-sm bg-gray-100 p-2 border rounded-lg"
            value={avatarUrl}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Gestos:</div>
            <select className="w-full p-2 border rounded-lg bg-white" value={gesture} onChange={handleGestureChange}>
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

          <div>
            <div className="text-sm font-medium mb-2">Ação no corpo:</div>
            <select className="w-full p-2 border rounded-lg bg-white" value={action} onChange={handleActionChange}>
              <option value="">Nada</option>
              <option value="std">Normal</option>
              <option value="lay">Dormindo</option>
            </select>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Corpo2:</div>
            <select className="w-full p-2 border rounded-lg bg-white" value={body2} onChange={handleBody2Change}>
              <option value="">Nada</option>
              <option value="sit">Sentado</option>
            </select>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Esquerda:</div>
            <select className="w-full p-2 border rounded-lg bg-white" value={left} onChange={handleLeftChange}>
              <option value="">Nada</option>
              <option value="respect">Respeito</option>
              <option value="wav">Acenando (Animado)</option>
            </select>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Direita:</div>
            <select className="w-full p-2 border rounded-lg bg-white" value={right} onChange={handleRightChange}>
              <option value="">Nada</option>
              <option value="crr">Mão esticada</option>
              <option value="drk">Mão na boca</option>
              <option value="blw">Mandando beijo</option>
            </select>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Sinais:</div>
            <select className="w-full p-2 border rounded-lg bg-white" value={sign} onChange={handleSignChange}>
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

          <div>
            <div className="text-sm font-medium mb-2">Objeto:</div>
            <select className="w-full p-2 border rounded-lg bg-white max-h-32 overflow-y-auto" value={object} onChange={handleObjectChange}>
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

export default AvatarEditor;