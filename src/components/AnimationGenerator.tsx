import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Play, Pause, RotateCcw, Download, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateAnimationSequence,
  generateHabboImagerUrl,
  generateGestureSequence,
  getDirectionInfo,
  DIRECTIONS,
  isValidAction,
  isValidDirection,
  type AnimationConfig,
  type AnimationFrame
} from '@/lib/habboAnimationGenerator';

export const AnimationGenerator: React.FC = () => {
  const { toast } = useToast();
  
  // Estados de configuração
  const [figureString, setFigureString] = useState('hd-180-1.hr-110-61.ch-210-66.lg-280-110.sh-305-62');
  const [habboName, setHabboName] = useState('habbohub');
  const [hotel, setHotel] = useState('com.br');
  const [action, setAction] = useState('mv');
  const [direction, setDirection] = useState(2);
  const [headDirection, setHeadDirection] = useState(2);
  
  // Estados de animação
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);
  const [loop, setLoop] = useState(true);
  
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
      const response = await fetch(`https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(habboName)}`);
      const data = await response.json();
      
      if (data && data.figureString) {
        setFigureString(data.figureString);
        toast({
          title: "Sucesso",
          description: `FigureString carregada para ${habboName}`
        });
      } else if (data && data.figure) {
        // Alguns endpoints retornam 'figure' em vez de 'figureString'
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
  
  // Gerar sequência de animação
  const generateFrames = () => {
    if (!figureString.trim()) {
      toast({
        title: "Erro",
        description: "FigureString não pode estar vazia",
        variant: "destructive"
      });
      return;
    }
    
    if (!isValidAction(action)) {
      toast({
        title: "Erro",
        description: "Action inválida",
        variant: "destructive"
      });
      return;
    }
    
    if (!isValidDirection(direction)) {
      toast({
        title: "Erro",
        description: "Direction deve ser entre 0 e 7",
        variant: "destructive"
      });
      return;
    }
    
    const config: AnimationConfig = {
      figureString,
      action,
      direction,
      headDirection,
      hotel,
      loop,
      userName: habboName.trim() || undefined
    };
    
    const generatedFrames = generateAnimationSequence(config);
    setFrames(generatedFrames);
    setCurrentFrameIndex(0);
    
    toast({
      title: "Animações geradas",
      description: `${generatedFrames.length} frames gerados com sucesso`
    });
  };
  
  // Gerar animação de caminhada em todas as direções
  const generateWalkingAllDirections = () => {
    if (!figureString.trim()) {
      toast({
        title: "Erro",
        description: "FigureString não pode estar vazia",
        variant: "destructive"
      });
      return;
    }
    
    // Para caminhada em múltiplas direções, vamos gerar uma sequência manual
    const allDirections = [0, 1, 2, 3, 4, 5, 6, 7];
    const frameCount = 8; // 8 frames para caminhada
    const generatedFrames: AnimationFrame[] = [];
    
    allDirections.forEach(dir => {
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
        const config: AnimationConfig = {
          figureString,
          action: 'mv',
          direction: dir,
          headDirection: dir,
          hotel,
          loop: false,
          userName: habboName.trim() || undefined
        };
        
        generatedFrames.push({
          frameIndex,
          direction: dir,
          headDirection: dir,
          action: 'mv',
          url: generateHabboImagerUrl(config, frameIndex)
        });
      }
    });
    
    setFrames(generatedFrames);
    setCurrentFrameIndex(0);
    
    toast({
      title: "Animações geradas",
      description: `${generatedFrames.length} frames de caminhada gerados (8 direções × 8 frames)`
    });
  };
  
  // Controles de reprodução
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => {
        const next = prev + 1;
        if (next >= frames.length) {
          if (loop) {
            return 0;
          } else {
            setIsPlaying(false);
            return prev;
          }
        }
        return next;
      });
    }, 1000 / fps);
    
    return () => clearInterval(interval);
  }, [isPlaying, frames.length, fps, loop]);
  
  // Frame atual
  const currentFrame = frames[currentFrameIndex];
  
  // Informações da direção atual
  const directionInfo = getDirectionInfo(direction);
  
  return (
    <div className="space-y-4">
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 volter-font">
            <Zap className="w-5 h-5" />
            Gerador de Animações Habbo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          {/* Informações do Guia */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Baseado no Guia Técnico de Animações</p>
                <p className="text-blue-700 text-xs">
                  Este gerador implementa a lógica descrita em <code className="bg-blue-100 px-1 rounded">docs/habbo-animation-guide.md</code>
                </p>
              </div>
            </div>
          </div>
          
          {/* Configuração de Entrada */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="habboName">Nome do Habbo:</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="habboName"
                  value={habboName}
                  onChange={(e) => setHabboName(e.target.value)}
                  placeholder="Digite o nome do Habbo"
                />
                <Button onClick={loadUserFigure} variant="outline" size="default">
                  Carregar
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="hotel">Hotel:</Label>
              <Select value={hotel} onValueChange={setHotel}>
                <SelectTrigger className="mt-1">
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
            
            <div>
              <Label htmlFor="figureString">FigureString:</Label>
              <Input
                id="figureString"
                value={figureString}
                onChange={(e) => setFigureString(e.target.value)}
                placeholder="hd-180-1.hr-110-61.ch-210-66..."
                className="mt-1 font-mono text-xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="action">Action:</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="std">std (Padrão)</SelectItem>
                    <SelectItem value="mv">mv (Caminhada)</SelectItem>
                    <SelectItem value="wave">wave (Acenar)</SelectItem>
                    <SelectItem value="sit">sit (Sentar)</SelectItem>
                    <SelectItem value="dance">dance (Dançar)</SelectItem>
                    <SelectItem value="laugh">laugh (Rir)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="direction">Direction (0-7):</Label>
                <Select 
                  value={direction.toString()} 
                  onValueChange={(v) => setDirection(parseInt(v))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map(dir => (
                      <SelectItem key={dir.code} value={dir.code.toString()}>
                        {dir.code} - {dir.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="headDirection">Head Direction (0-7):</Label>
              <Select 
                value={headDirection.toString()} 
                onValueChange={(v) => setHeadDirection(parseInt(v))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map(dir => (
                    <SelectItem key={dir.code} value={dir.code.toString()}>
                      {dir.code} - {dir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Botões de Geração */}
          <div className="flex gap-2">
            <Button 
              onClick={generateFrames} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              🎬 Gerar Animação
            </Button>
            <Button 
              onClick={generateWalkingAllDirections} 
              variant="outline"
              className="flex-1"
            >
              🚶 Caminhada (8 direções)
            </Button>
          </div>
          
          {/* Preview da Animação */}
          {frames.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Preview da Animação</Label>
                  <p className="text-xs text-gray-600">
                    Frame {currentFrameIndex + 1} de {frames.length} | 
                    Direction: {directionInfo.name} ({direction}) | 
                    Action: {action}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    size="sm"
                    variant={isPlaying ? "destructive" : "default"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => setCurrentFrameIndex(0)}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded border-2 border-dashed border-gray-300 p-4 flex justify-center items-center min-h-[200px]">
                {currentFrame && (
                  <img
                    src={currentFrame.url}
                    alt={`Frame ${currentFrameIndex + 1}`}
                    className="max-w-full max-h-[300px]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              
              {/* Controles de FPS e Loop */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="loop"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="loop" className="text-xs">Loop</Label>
                </div>
                <div className="text-xs text-gray-600">
                  {frames.length} frames gerados
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentFrameIndex + 1) / frames.length) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Informações Técnicas */}
          {frames.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-1">
              <p className="font-semibold">Informações Técnicas:</p>
              <p className="text-gray-600">
                <strong>Action:</strong> {action} → {action === 'mv' ? 'wlk' : action} (prefixo de asset)
              </p>
              <p className="text-gray-600">
                <strong>Frames:</strong> {frames.length} frames (baseado no tipo de animação)
              </p>
              <p className="text-gray-600">
                <strong>URL Pattern:</strong> Habbo Imager API com parâmetros figure, direction, action
              </p>
              <p className="text-gray-600 text-[10px] mt-2">
                💡 Para animações quadro a quadro completas, seria necessário um renderizador customizado 
                (ex: Nitro-Imager) que aceita frame como parâmetro. O Habbo Imager oficial retorna 
                frames estáticos baseados em action/gesture.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimationGenerator;