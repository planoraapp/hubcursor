import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCw, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateHabboImagerUrl,
  DIRECTIONS,
  type AnimationConfig,
  type AnimationFrame
} from '@/lib/habboAnimationGenerator';

interface AnimationGeneratorModalProps {
  figureString?: string;
  initialHotel?: string;
}

// Animações disponíveis com informações sobre loop
// Baseado no formato do Habbo Imager: gesture=nrm/sml/sad/agr/srp/eyb/spk e action=wlk/wav/sit/lay/crr/drk
const ANIMATIONS = [
  { action: '', gesture: 'nrm', name: 'Normal', icon: '🧍', loop: false },
  { action: 'wlk', gesture: 'nrm', name: 'Caminhar', icon: '🚶', loop: true },
  { action: 'wav', gesture: 'nrm', name: 'Acenar', icon: '👋', loop: true },
  { action: '', gesture: 'sml', name: 'Sorrir', icon: '😊', loop: false },
  { action: '', gesture: 'sad', name: 'Triste', icon: '😢', loop: false },
  { action: '', gesture: 'agr', name: 'Bravo', icon: '😠', loop: false },
  { action: '', gesture: 'srp', name: 'Surpreso', icon: '😲', loop: false },
  { action: '', gesture: 'spk', name: 'Falar', icon: '💬', loop: true },
  { action: '', gesture: 'eyb', name: 'Dormido', icon: '😴', loop: false },
  { action: 'sit', gesture: 'nrm', name: 'Sentar', icon: '🪑', loop: false },
  { action: 'lay', gesture: 'nrm', name: 'Deitar', icon: '🛏️', loop: false },
  { action: 'crr', gesture: 'nrm', name: 'Segurar', icon: '🤲', loop: false },
];

export const AnimationGeneratorModal: React.FC<AnimationGeneratorModalProps> = ({
  figureString: initialFigureString = 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1',
  initialHotel = 'com.br'
}) => {
  const { toast } = useToast();
  
  const [figureString, setFigureString] = useState(initialFigureString);
  const [habboName, setHabboName] = useState('');
  const [hotel, setHotel] = useState(initialHotel);
  const [selectedAnimation, setSelectedAnimation] = useState(ANIMATIONS[0]);
  const [direction, setDirection] = useState(2);
  const [headDirection, setHeadDirection] = useState(2);
  const [isHolding, setIsHolding] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  
  // Estados de animação
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);

  // Função auxiliar para obter o domínio correto do hotel
  const getHotelDomain = useCallback((hotelCode: string) => {
    // Se já contém 'habbo.', retorna como está
    if (hotelCode.includes('habbo.')) {
      return hotelCode;
    }
    // Caso contrário, adiciona 'habbo.' antes
    return `habbo.${hotelCode}`;
  }, []);

  // Carregar figureString do usuário via API
  const loadUserFigure = async () => {
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome de Habbo",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const hotelUrl = getHotelDomain(hotel);
      const response = await fetch(`https://www.${hotelUrl}/api/public/users?name=${encodeURIComponent(habboName)}`);
      const data = await response.json();
      
      if (data && data.figureString) {
        setFigureString(data.figureString);
        toast({
          title: "Sucesso",
          description: `FigureString carregada para ${habboName}`
        });
      } else if (data && data.figure) {
        setFigureString(data.figure);
        toast({
          title: "Sucesso",
          description: `FigureString carregada para ${habboName}`
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o avatar. Verifique se o nome está correto.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar dados do usuário",
        variant: "destructive"
      });
    }
  };

  // Gerar frames da animação
  const generateFrames = useCallback(() => {
    if (!figureString.trim()) {
      toast({
        title: "Erro",
        description: "FigureString não pode estar vazia",
        variant: "destructive"
      });
      return;
    }

    const hotelUrl = getHotelDomain(hotel);
    let generatedFrames: AnimationFrame[] = [];
    
    // Para caminhada (wlk), usar o sistema de animação existente que gera múltiplos frames
    if (selectedAnimation.action === 'wlk') {
      // Para caminhada, criar múltiplos frames simulando o movimento
      // O Habbo Imager não suporta frames diretamente, então criamos variações
      const frameCount = 8; // 8 frames para caminhada
      
      for (let i = 0; i < frameCount; i++) {
        const params = new URLSearchParams();
        
        if (habboName.trim()) {
          params.set('user', habboName.trim());
        } else {
          params.set('figure', figureString);
        }
        
        params.set('direction', direction.toString());
        params.set('head_direction', headDirection.toString());
        params.set('size', 'l');
        params.set('img_format', 'png');
        params.set('action', 'wlk'); // Usar wlk diretamente
        params.set('gesture', selectedAnimation.gesture);
        
        // Adicionar timestamp para diferenciar frames
        params.set('_t', Date.now().toString() + i.toString());
        
        generatedFrames.push({
          frameIndex: i,
          direction,
          headDirection,
          action: 'wlk',
          url: `https://www.${hotelUrl}/habbo-imaging/avatarimage?${params.toString()}`
        });
      }
    } else if (selectedAnimation.gesture === 'spk') {
      // Animação de fala: alternar entre 'spk' e 'nrm' para simular movimento da boca
      // Criar 8 frames alternando entre spk e nrm (4 de cada)
      const frameCount = 8;
      
      for (let i = 0; i < frameCount; i++) {
        const params = new URLSearchParams();
        
        if (habboName.trim()) {
          params.set('user', habboName.trim());
        } else {
          params.set('figure', figureString);
        }
        
        params.set('direction', direction.toString());
        params.set('head_direction', headDirection.toString());
        params.set('size', 'l');
        params.set('img_format', 'png');
        
        // Alternar entre 'spk' e 'nrm' para simular movimento da boca
        // Frame par = spk, Frame ímpar = nrm
        const gesture = i % 2 === 0 ? 'spk' : 'nrm';
        params.set('gesture', gesture);
        
        // Adicionar timestamp para diferenciar frames e forçar recarregamento
        params.set('_t', Date.now().toString() + i.toString());
        
        generatedFrames.push({
          frameIndex: i,
          direction,
          headDirection,
          action: 'std',
          url: `https://www.${hotelUrl}/habbo-imaging/avatarimage?${params.toString()}`
        });
      }
    } else {
      // Para outras animações, criar frames baseados no tipo
      // Animações com loop precisam de múltiplos frames para simular movimento
      const frameCount = selectedAnimation.loop ? 8 : 1;
      
      for (let i = 0; i < frameCount; i++) {
        const params = new URLSearchParams();
        
        // Usar user se disponível, senão usar figure
        if (habboName.trim()) {
          params.set('user', habboName.trim());
        } else {
          params.set('figure', figureString);
        }
        
        params.set('direction', direction.toString());
        params.set('head_direction', headDirection.toString());
        params.set('size', 'l');
        params.set('img_format', 'png');
        
        // Adicionar action se não estiver vazio
        // Formato correto: action=wlk, action=wav, action=sit, action=lay, etc.
        // Para combinar ações, usar vírgulas: action=sit,crr=1
        let actionValue = '';
        
        // Prioridade: se está sentado e segurando, combinar sit com crr
        if (isSitting && isHolding) {
          actionValue = 'sit,crr=1';
        } else if (isSitting) {
          actionValue = 'sit';
        } else if (isHolding) {
          actionValue = ',crr=1';
          // Se há uma animação selecionada que não seja sit ou crr, combinar
          if (selectedAnimation.action && selectedAnimation.action !== '' && selectedAnimation.action !== 'sit' && selectedAnimation.action !== 'crr') {
            actionValue = `${selectedAnimation.action},crr=1`;
          }
        } else if (selectedAnimation.action && selectedAnimation.action !== '') {
          actionValue = selectedAnimation.action;
        }
        
        if (actionValue) {
          params.set('action', actionValue);
        }
        
        // Adicionar gesture (nrm, sml, sad, agr, srp, eyb, spk)
        // Formato correto: gesture=nrm (não gesture=std!)
        params.set('gesture', selectedAnimation.gesture);
        
        // Para animações com loop, adicionar timestamp para forçar recarregamento
        // Isso ajuda a criar uma sensação de movimento mesmo que o Habbo Imager
        // retorne o mesmo frame
        if (selectedAnimation.loop && frameCount > 1) {
          params.set('_t', Date.now().toString() + i.toString());
        }
        
        generatedFrames.push({
          frameIndex: i,
          direction,
          headDirection,
          action: selectedAnimation.action || 'std',
          url: `https://www.${hotelUrl}/habbo-imaging/avatarimage?${params.toString()}`
        });
      }
    }

    setFrames(generatedFrames);
    setCurrentFrameIndex(0);
    
    // Se a animação deve fazer loop, iniciar automaticamente
    if (selectedAnimation.loop && generatedFrames.length > 1) {
      setIsPlaying(true);
    }
  }, [figureString, selectedAnimation, direction, headDirection, hotel, habboName, isHolding, isSitting, toast, getHotelDomain]);

  // Efeito para gerar frames quando a animação mudar
  useEffect(() => {
    if (figureString) {
      generateFrames();
    }
  }, [selectedAnimation, direction, headDirection, hotel, isHolding, isSitting, generateFrames]);

  // Controle de reprodução da animação
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => {
        const next = prev + 1;
        if (next >= frames.length) {
          if (selectedAnimation.loop) {
            return 0; // Loop infinito
          } else {
            setIsPlaying(false);
            return prev;
          }
        }
        return next;
      });
    }, 1000 / fps);
    
    return () => clearInterval(interval);
  }, [isPlaying, frames.length, fps, selectedAnimation.loop]);

  // Função para gerar URL de fallback
  const getFallbackAvatarUrl = useCallback(() => {
    const hotelUrl = getHotelDomain(hotel);
    return `https://www.${hotelUrl}/habbo-imaging/avatarimage?figure=hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1&direction=${direction}&head_direction=${headDirection}&size=l&gesture=nrm`;
  }, [hotel, direction, headDirection, getHotelDomain]);

  // Gerar URL do avatar para preview (sempre atualizado)
  const previewAvatarUrl = useMemo(() => {
    if (!figureString.trim()) return '';
    
    const hotelUrl = getHotelDomain(hotel);
    const params = new URLSearchParams();
    
    if (habboName.trim()) {
      params.set('user', habboName.trim());
    } else {
      params.set('figure', figureString);
    }
    
    params.set('direction', direction.toString());
    params.set('head_direction', headDirection.toString());
    params.set('size', 'l');
    params.set('img_format', 'png');
    
    // Construir action combinando animação selecionada com segurar/sentar
    let actionValue = '';
    
    // Prioridade: se está sentado e segurando, combinar sit com crr
    if (isSitting && isHolding) {
      actionValue = 'sit,crr=1';
    } else if (isSitting) {
      actionValue = 'sit';
    } else if (isHolding) {
      actionValue = ',crr=1';
      // Se há uma animação selecionada que não seja sit ou crr, combinar
      if (selectedAnimation.action && selectedAnimation.action !== '' && selectedAnimation.action !== 'sit' && selectedAnimation.action !== 'crr') {
        actionValue = `${selectedAnimation.action},crr=1`;
      }
    } else if (selectedAnimation.action && selectedAnimation.action !== '') {
      actionValue = selectedAnimation.action;
    }
    
    if (actionValue) {
      params.set('action', actionValue);
    }
    
    params.set('gesture', selectedAnimation.gesture);
    
    return `https://www.${hotelUrl}/habbo-imaging/avatarimage?${params.toString()}`;
  }, [figureString, habboName, hotel, direction, headDirection, selectedAnimation, isHolding, isSitting, getHotelDomain]);

  // Frame atual e informações da direção
  const currentFrame = frames[currentFrameIndex];
  const directionInfo = DIRECTIONS.find(d => d.code === direction) || DIRECTIONS[2];

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Layout com campos à esquerda e figurestring à direita */}
      <div className="grid grid-cols-2 gap-4">
        {/* Coluna Esquerda - Campos de Entrada */}
        <div className="space-y-4">
          {/* Busca de Usuário */}
          <div className="space-y-2">
            <Label htmlFor="habboName">Nome do Habbo:</Label>
            <div className="flex gap-2">
              <Input
                id="habboName"
                value={habboName}
                onChange={(e) => setHabboName(e.target.value)}
                placeholder="Digite o nome do Habbo"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    loadUserFigure();
                  }
                }}
              />
              <Button onClick={loadUserFigure} variant="outline" size="default">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Hotel Selector */}
          <div className="space-y-2">
            <Label htmlFor="hotel">Hotel:</Label>
            <Select value={hotel} onValueChange={setHotel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="com.br">Habbo Brasil</SelectItem>
                <SelectItem value="com">Habbo Global</SelectItem>
                <SelectItem value="es">Habbo Espanha</SelectItem>
                <SelectItem value="it">Habbo Itália</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Direções */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="direction">Direção do Corpo:</Label>
              <Button
                id="direction"
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  const nextDirection = (direction + 1) % 8;
                  setDirection(nextDirection);
                  setHeadDirection(nextDirection); // Rotaciona corpo e cabeça juntos
                }}
              >
                <span>{direction} - {DIRECTIONS.find(d => d.code === direction)?.name || 'Desconhecido'}</span>
                <RotateCw className="w-4 h-4 opacity-50" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headDirection">Direção da Cabeça:</Label>
              <Button
                id="headDirection"
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  const nextHeadDirection = (headDirection + 1) % 8;
                  setHeadDirection(nextHeadDirection); // Rotaciona apenas a cabeça
                }}
              >
                <span>{headDirection} - {DIRECTIONS.find(d => d.code === headDirection)?.name || 'Desconhecido'}</span>
                <RotateCw className="w-4 h-4 opacity-50" />
              </Button>
            </div>
          </div>

          {/* Opções de Combinação */}
          <div className="space-y-2">
            <Label>Opções Adicionais:</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isSitting ? "default" : "outline"}
                size="sm"
                onClick={() => setIsSitting(!isSitting)}
                className="flex-1"
              >
                🪑 {isSitting ? 'Sentado' : 'Sentar'}
              </Button>
              <Button
                type="button"
                variant={isHolding ? "default" : "outline"}
                size="sm"
                onClick={() => setIsHolding(!isHolding)}
                className="flex-1"
              >
                🤲 {isHolding ? 'Segurando' : 'Segurar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Preview da FigureString */}
        <div className="space-y-2">
          <Label>Preview do Avatar:</Label>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 p-4 flex justify-center items-center min-h-[200px] h-full">
            {figureString.trim() ? (
              <img
                src={previewAvatarUrl}
                alt={`Avatar - ${selectedAnimation.name}`}
                className="max-w-full max-h-[300px]"
                style={{ imageRendering: 'pixelated' }}
                key={previewAvatarUrl} // Força recarregamento quando URL mudar
                onError={(e) => {
                  // Fallback para avatar padrão
                  e.currentTarget.src = getFallbackAvatarUrl();
                }}
              />
            ) : (
              <div className="text-gray-400 text-sm text-center">
                <p>Digite uma figurestring</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seleção de Animações */}
      <div className="space-y-2">
        <Label>Animações:</Label>
        <div className="grid grid-cols-3 gap-2">
          {ANIMATIONS.map((anim) => (
            <Button
              key={`${anim.action}-${anim.gesture}`}
              variant={selectedAnimation === anim ? "default" : "outline"}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => {
                setSelectedAnimation(anim);
                setCurrentFrameIndex(0);
                // Atualizar estados de sentar/segurar baseado na animação selecionada
                if (anim.action === 'sit') {
                  setIsSitting(true);
                } else if (anim.action === 'crr') {
                  setIsHolding(true);
                }
              }}
              title={anim.name}
            >
              <span className="text-lg">{anim.icon}</span>
              <span className="text-xs">{anim.name}</span>
              {anim.loop && (
                <span className="text-[10px] opacity-70">🔄</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Controles de Animação */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            size="sm"
            variant={isPlaying ? "destructive" : "default"}
            disabled={frames.length <= 1}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => {
              setCurrentFrameIndex(0);
              setIsPlaying(false);
            }}
            size="sm"
            variant="outline"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          {frames.length > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor="fps" className="text-xs">FPS:</Label>
              <Input
                id="fps"
                type="number"
                min="1"
                max="30"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value) || 12)}
                className="w-16 h-8"
              />
            </div>
          )}
        </div>
        <div className="text-xs text-gray-600">
          {selectedAnimation.name} • {directionInfo.name} ({direction})
          {frames.length > 1 && ` • Frame ${currentFrameIndex + 1}/${frames.length}`}
          {selectedAnimation.loop && ' • 🔄 Loop'}
        </div>
      </div>
    </div>
  );
};

