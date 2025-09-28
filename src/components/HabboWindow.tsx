import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HabboWindowProps {
  title: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

interface UserData {
  id: string;
  username: string;
  figure: string;
  motto: string;
  lastLogin: string;
}

interface AvatarPart {
  id: string;
  name: string;
  image: string;
}

export const HabboWindow: React.FC<HabboWindowProps> = ({
  title,
  onClose,
  onMinimize,
  onMaximize,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 }
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Estados do avatar - pré-carregados com habbohub
  const [habboName, setHabboName] = useState('habbohub');
  const [hotel, setHotel] = useState('com.br');
  const [action, setAction] = useState('None');
  const [gesture, setGesture] = useState('None');
  const [displayMode, setDisplayMode] = useState<'full' | 'head'>('full');
  const [headDirection, setHeadDirection] = useState('2');
  const [bodyDirection, setBodyDirection] = useState('2');
  const [generatedCode, setGeneratedCode] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const windowRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Função para gerar URL do avatar real
  const generateAvatarUrl = () => {
    const params = new URLSearchParams();
    params.set('user', habboName);
    
    if (displayMode === 'head') {
      // Para só cabeça, usar headonly=1 e head_direction
      params.set('headonly', '1');
      params.set('head_direction', headDirection);
      params.set('size', 'l'); // Tamanho grande para qualidade
    } else {
      // Para corpo inteiro, usar direction e head_direction
      params.set('direction', bodyDirection);
      params.set('head_direction', headDirection);
      params.set('size', 'l'); // Tamanho grande para corpo inteiro
    }
    
    if (action !== 'None') {
      params.set('action', action);
    }
    
    if (gesture !== 'None') {
      params.set('gesture', gesture);
    }
    
    return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?${params.toString()}`;
  };

  // Função para rotacionar cabeça
  const rotateHead = () => {
    const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const currentIndex = directions.indexOf(headDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setHeadDirection(directions[nextIndex]);
  };

  // Função para rotacionar corpo
  const rotateBody = () => {
    const directions = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const currentIndex = directions.indexOf(bodyDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setBodyDirection(directions[nextIndex]);
  };

  // Gerar código do avatar
  const generateAvatarCode = () => {
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome de Habbo",
        variant: "destructive"
      });
      return;
    }

    // Gerar figure string baseada nas seleções
    const figureString = `hr-1-40.ch-210-66.lg-270-82.sh-290-81.hd-180-1`;
    
    const code = `// Habbo Avatar - ${habboName}
const avatarConfig = {
  hotel: '${hotel}',
  figure: '${figureString}',
  nickname: '${habboName}',
  action: '${action}',
  gesture: '${gesture}',
  displayMode: '${displayMode}',
  headDirection: '${headDirection}',
  bodyDirection: '${bodyDirection}'
};

// HTML
<div class="habbo-avatar" 
     data-hotel="${hotel}" 
     data-figure="${figureString}"
     data-nickname="${habboName}"
     data-action="${action}"
     data-gesture="${gesture}"
     data-display-mode="${displayMode}"
     data-head-direction="${headDirection}"
     data-body-direction="${bodyDirection}">
</div>

// JavaScript
const avatar = new HabboAvatar('.habbo-avatar');
avatar.render();

// URL da imagem
const imageUrl = \`https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${habboName}${displayMode === 'head' ? `&headonly=1&head_direction=${headDirection}&size=l` : `&direction=${bodyDirection}&head_direction=${headDirection}&size=l`}${action !== 'None' ? `&action=${action}` : ''}${gesture !== 'None' ? `&gesture=${gesture}` : ''}\`;`;

    setGeneratedCode(code);
  };

  // Copiar código para clipboard
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Sucesso",
        description: "Código copiado para a área de transferência!"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código",
        variant: "destructive"
      });
    }
  };

  // Handlers para drag and drop
  const handleMouseDown = (e: React.MouseEvent) => {
    // Permitir drag apenas no header ou quando clicar diretamente no container principal
    const target = e.target as HTMLElement;
    if (target.classList.contains('dialog_header') || 
        target.classList.contains('cursor-move') ||
        e.target === e.currentTarget) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Atualizar preview do avatar quando mudanças forem feitas
  useEffect(() => {
    setAvatarPreview(generateAvatarUrl());
  }, [habboName, hotel, action, gesture, displayMode, headDirection, bodyDirection]);

  return (
    <div
      ref={windowRef}
      className={`dialog fixed bg-white/90 backdrop-blur-sm border-2 border-black shadow-xl ${isDragging ? 'shadow-2xl scale-105' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 1000,
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Botões da janela */}
      <div className="dialog_close absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 cursor-pointer" 
           onClick={onClose}></div>
      <div className="dialog_minimize absolute top-1 right-6 w-4 h-4 bg-gray-500 hover:bg-gray-600 cursor-pointer" 
           onClick={onMinimize}></div>
      <div className="dialog_maximize absolute top-1 right-11 w-4 h-4 bg-green-500 hover:bg-green-600 cursor-pointer" 
           onClick={onMaximize}></div>

      {/* Header da janela */}
      <div className="dialog_header bg-white/90 border-b border-black p-3 cursor-move select-none" onMouseDown={handleMouseDown}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 volter-font">{title}</h3>
          <div className="text-xs text-gray-500">Arraste para mover</div>
        </div>
      </div>

      {/* Conteúdo da janela */}
      <div className="dialog_content p-4">
        <div className="flex h-full gap-4">
          {/* Painel Esquerdo - Controles */}
          <div className="w-1/2 space-y-4">
            {/* Detalhes do Habbo */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="habboName" className="text-sm font-medium">Habbo Name:</Label>
                <Input
                  id="habboName"
                  value={habboName}
                  onChange={(e) => setHabboName(e.target.value)}
                  placeholder="Digite o nome do Habbo"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="hotel" className="text-sm font-medium">Hotel:</Label>
                <Select value={hotel} onValueChange={setHotel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="com.br">Habbo Brasil (.com.br)</SelectItem>
                    <SelectItem value="com">Habbo Global (.com)</SelectItem>
                    <SelectItem value="com.tr">Habbo Turquia (.com.tr)</SelectItem>
                    <SelectItem value="fi">Habbo Finlândia (.fi)</SelectItem>
                    <SelectItem value="es">Habbo Espanha (.es)</SelectItem>
                    <SelectItem value="it">Habbo Itália (.it)</SelectItem>
                    <SelectItem value="nl">Habbo Holanda (.nl)</SelectItem>
                    <SelectItem value="de">Habbo Alemanha (.de)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="action" className="text-sm font-medium">Action:</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="wave">Wave (Acenar)</SelectItem>
                    <SelectItem value="sit">Sit (Sentar)</SelectItem>
                    <SelectItem value="stand">Stand (Levantar)</SelectItem>
                    <SelectItem value="dance">Dance (Dançar)</SelectItem>
                    <SelectItem value="laugh">Laugh (Rir)</SelectItem>
                    <SelectItem value="idle">Idle (Inativo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="gesture" className="text-sm font-medium">Gesture:</Label>
                <Select value={gesture} onValueChange={setGesture}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="sml">Small (Pequeno)</SelectItem>
                    <SelectItem value="srp">Super (Super)</SelectItem>
                    <SelectItem value="sad">Sad (Triste)</SelectItem>
                    <SelectItem value="agr">Angry (Bravo)</SelectItem>
                    <SelectItem value="thr">Thrilled (Empolgado)</SelectItem>
                    <SelectItem value="eyb">Eye Blink (Piscar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Modo de Exibição */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Modo de Exibição:</Label>
              <div className="flex gap-2">
                <Button 
                  variant={displayMode === 'full' ? 'default' : 'outline'}
                  onClick={() => setDisplayMode('full')}
                  className="flex-1"
                >
                  Corpo Inteiro
                </Button>
                <Button 
                  variant={displayMode === 'head' ? 'default' : 'outline'}
                  onClick={() => setDisplayMode('head')}
                  className="flex-1"
                >
                  Só Cabeça
                </Button>
              </div>
            </div>

            {/* Controles de Rotação */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Controles:</Label>
              <div className="flex gap-2">
                <Button 
                  onClick={rotateHead}
                  variant="outline"
                  className="flex-1"
                >
                  🔄 Rotacionar Cabeça
                </Button>
                <Button 
                  onClick={rotateBody}
                  variant="outline"
                  className="flex-1"
                >
                  🔄 Rotacionar Corpo
                </Button>
              </div>
            </div>

            {/* Botão Create */}
            <div className="pt-2">
              <Button 
                onClick={generateAvatarCode}
                className="w-full bg-blue-600 hover:bg-blue-700 volter-font"
              >
                Create <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Painel Direito - Preview */}
          <div className="w-1/2 space-y-4">
            {/* Preview do Avatar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview:</Label>
              <div className={`flex justify-center items-center bg-gray-50 rounded border-2 border-dashed border-gray-300 ${displayMode === 'head' ? 'h-32' : 'h-64'}`}>
                {avatarPreview && (
                  <img 
                    src={`${avatarPreview}&img_format=png`}
                    alt={`Avatar de ${habboName}`}
                    className="max-w-full max-h-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>

            {/* Informações */}
            <div className="space-y-2 text-sm">
              <div className="bg-gray-100 p-2 rounded">
                <strong>Modo:</strong> {displayMode === 'full' ? 'Corpo Inteiro' : 'Só Cabeça'}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Direção Cabeça:</strong> {headDirection}
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <strong>Direção Corpo:</strong> {bodyDirection}
              </div>
            </div>

            {/* Código Gerado */}
            {generatedCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Código Gerado:</Label>
                  <Button 
                    onClick={copyCode} 
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <Textarea
                  value={generatedCode}
                  readOnly
                  className="text-xs font-mono min-h-[100px] bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabboWindow;
