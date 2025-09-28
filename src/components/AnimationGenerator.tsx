import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Save,
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface AnimationStep {
  id: string;
  type: 'action' | 'delay' | 'direction' | 'gesture';
  value: any;
  duration?: number;
}

interface Sequence {
  id: string;
  name: string;
  steps: AnimationStep[];
}

// Classe Avatar baseada no código do CodePen
class Avatar {
  hotel = 'com.br';
  nickname: string | null = null;
  figure: string | null = null;
  img: HTMLImageElement | null = null;
  container: HTMLElement | null = null;
  
  state = {
    headDirection: 2,
    bodyDirection: 2,
    gesture: 'none',
    action: ['std'],
    frame: 0,
  };
  
  shouldUpdate = true;

  constructor(container: HTMLElement) {
    this.container = container;
    this.hotel = container.getAttribute('data-hotel') || 'com.br';
    this.nickname = container.getAttribute('data-nickname');
    this.figure = container.getAttribute('data-figure');
    this.img = document.createElement('img');
    this.img.style.maxWidth = '100%';
    this.img.style.height = 'auto';
    container.appendChild(this.img);
    this.reset();
  }
  
  reset() {
    this.shouldUpdate = true;
    this.state = {
      headDirection: 2,
      bodyDirection: 2,
      gesture: 'none',
      action: ['std'],
      frame: 0,
    };
  }
  
  render() {
    if (!this.shouldUpdate || !this.img) return;
    
    if (!(this.nickname || this.figure)) {
      console.error("Nickname or Figure should be defined.");
      return;
    }

    const params = new URLSearchParams();
    if (this.figure) {
      params.set('figure', this.figure);
    } else if (this.nickname) {
      params.set('user', this.nickname);
    }
    params.set('direction', this.state.bodyDirection.toString());
    params.set('head_direction', this.state.headDirection.toString());
    
    if (this.state.gesture !== 'none') {
      params.set('gesture', this.state.gesture);
    }
    
    let actions = [];
    for (const action of this.state.action) {
      if (action === 'wlk') actions.unshift(action);
      else if (Array.isArray(action)) actions.push(action.join('='));
      else actions.push(action);
    }
    if (actions.length) {
      params.set('action', actions.join(','));
    }
    
    let frameLimit = 1;
    if (this.state.action.includes('wav')) {
      frameLimit = 2;
    } else if (this.state.action.includes('wlk')) {
      frameLimit = 4;
    }
    this.state.frame = (this.state.frame + 1) % frameLimit;
    params.set('frame', this.state.frame.toString());

    if (this.img.complete) {
      this.img.src = `https://www.habbo.${this.hotel}/habbo-imaging/avatarimage?${params.toString()}`;
    }
    
    if (!this.state.action.includes('wav') && !this.state.action.includes('wlk')) {
      this.shouldUpdate = false;
    }
  }
  
  set walk(duration: number = Infinity) {
    this.shouldUpdate = true;
    if (duration <= 0) {
      const index = this.state.action.indexOf('wlk');
      if (index > -1) {
        this.state.action.splice(index, 1);
        this.state.action.push('std');
      }
      return;
    }
    if (!this.state.action.includes('wlk')) {
      const index = this.state.action.indexOf('std');
      if (index > -1) {
        this.state.action.splice(index, 1);
      }
      this.state.action.push('wlk');
    }

    if (duration < Infinity) {
      setTimeout(() => {
        this.walk = 0;
      }, duration * 1000);
    }
  }
  
  set wave(duration: number = Infinity) {
    this.shouldUpdate = true;
    if (duration <= 0) {
      const index = this.state.action.indexOf('wav');
      if (index > -1) {
        this.state.action.splice(index, 1);
        this.state.action.push('std');
      }
      return;
    }
    if (!this.state.action.includes('wav')) {
      const index = this.state.action.indexOf('std');
      if (index > -1) {
        this.state.action.splice(index, 1);
      }
      this.state.action.push('wav');
    }

    if (duration < Infinity) {
      setTimeout(() => {
        this.wave = 0;
      }, duration * 1000);
    }
  }
  
  set direction(dir: number | [number, number]) {
    this.shouldUpdate = true;
    if (Array.isArray(dir)) {
      if (typeof dir[0] === 'number') {
        this.state.headDirection = dir[0];
      }
      if (typeof dir[1] === 'number') {
        this.state.bodyDirection = dir[1];
      }
    } else if (typeof dir === 'number') {
      this.state.headDirection = dir;
      this.state.bodyDirection = dir;
    }
  }
  
  set gesture(gesture: string = 'none') {
    this.shouldUpdate = true;
    if (!['sml', 'srp', 'sad', 'agr'].includes(gesture)) {
      this.state.gesture = 'none';
    } else {
      this.state.gesture = gesture;
    }
  }
}

export const AnimationGenerator: React.FC = () => {
  const [hotel, setHotel] = useState('com.br');
  const [nickname, setNickname] = useState('');
  const [figure, setFigure] = useState('');
  const [currentSequence, setCurrentSequence] = useState<Sequence>({
    id: '1',
    name: 'Nova Sequência',
    steps: []
  });
  const [sequences, setSequences] = useState<Sequence[]>([
    {
      id: '1',
      name: 'Wardrobe',
      steps: [
        { id: '1', type: 'action', value: 'walk', duration: 2 },
        { id: '2', type: 'delay', value: 2 },
        { id: '3', type: 'direction', value: [3, null] },
        { id: '4', type: 'gesture', value: 'sml' },
        { id: '5', type: 'delay', value: 0.5 },
        { id: '6', type: 'direction', value: 3 },
        { id: '7', type: 'action', value: 'wave', duration: 3 },
        { id: '8', type: 'delay', value: 4 },
      ]
    },
    {
      id: '2',
      name: 'Rotate',
      steps: [
        { id: '1', type: 'direction', value: 2 },
        { id: '2', type: 'direction', value: 3 },
        { id: '3', type: 'direction', value: 4 },
        { id: '4', type: 'direction', value: 5 },
        { id: '5', type: 'direction', value: 6 },
        { id: '6', type: 'direction', value: 7 },
        { id: '7', type: 'direction', value: 0 },
        { id: '8', type: 'direction', value: 1 },
      ]
    }
  ]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const avatarRef = useRef<HTMLDivElement>(null);
  const avatarInstance = useRef<Avatar | null>(null);
  const animationRef = useRef<number | null>(null);
  const controlRef = useRef({
    fps: 6,
    frameCount: 0,
    fpsInterval: 0,
    fpsThen: Date.now(),
    sequence: [] as any[],
    seqThen: Date.now(),
    seqDelay: 0,
  });

  useEffect(() => {
    if (avatarRef.current && !avatarInstance.current) {
      avatarInstance.current = new Avatar(avatarRef.current);
    }
  }, []);

  useEffect(() => {
    if (avatarInstance.current) {
      if (nickname) {
        avatarInstance.current.nickname = nickname;
        avatarInstance.current.figure = null;
      } else if (figure) {
        avatarInstance.current.figure = figure;
        avatarInstance.current.nickname = null;
      }
      avatarInstance.current.hotel = hotel;
      avatarInstance.current.render();
    }
  }, [hotel, nickname, figure]);

  const addStep = (type: AnimationStep['type']) => {
    const newStep: AnimationStep = {
      id: Date.now().toString(),
      type,
      value: type === 'delay' ? 1 : (type === 'direction' ? 2 : 'walk'),
      duration: type === 'action' ? 2 : undefined
    };
    
    setCurrentSequence(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepId: string, field: keyof AnimationStep, value: any) => {
    setCurrentSequence(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (stepId: string) => {
    setCurrentSequence(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const playAnimation = () => {
    if (!avatarInstance.current || currentSequence.steps.length === 0) return;
    
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentStep(0);
    
    avatarInstance.current.reset();
    controlRef.current.sequence = currentSequence.steps.map(step => {
      if (step.type === 'delay') {
        return step.value;
      } else if (step.type === 'action') {
        return (avatar: Avatar) => {
          if (step.value === 'walk') {
            avatar.walk = step.duration || Infinity;
          } else if (step.value === 'wave') {
            avatar.wave = step.duration || Infinity;
          }
        };
      } else if (step.type === 'direction') {
        return (avatar: Avatar) => {
          avatar.direction = step.value;
        };
      } else if (step.type === 'gesture') {
        return (avatar: Avatar) => {
          avatar.gesture = step.value;
        };
      }
      return step.value;
    });
    
    controlRef.current.fpsInterval = 1000 / controlRef.current.fps;
    controlRef.current.fpsThen = Date.now();
    controlRef.current.seqThen = Date.now();
    controlRef.current.seqDelay = 0;
    
    animate();
  };

  const animate = () => {
    if (!avatarInstance.current) return;
    
    const now = Date.now();
    const fpsElapsed = now - controlRef.current.fpsThen;
    const seqElapsed = now - controlRef.current.seqThen;
    
    if (fpsElapsed > controlRef.current.fpsInterval) {
      controlRef.current.fpsThen = now - (fpsElapsed % controlRef.current.fpsInterval);
      
      if (controlRef.current.sequence.length && seqElapsed > controlRef.current.seqDelay) {
        const step = controlRef.current.sequence.shift();
        
        if (typeof step === 'number') {
          controlRef.current.seqDelay = step * 1000;
        } else if (typeof step === 'function') {
          step(avatarInstance.current);
          controlRef.current.seqDelay = 0;
        }
        
        controlRef.current.seqThen = now;
        setCurrentStep(prev => prev + 1);
      }
      
      avatarInstance.current.render();
      controlRef.current.frameCount++;
    }
    
    if (isPlaying && !isPaused) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const pauseAnimation = () => {
    setIsPaused(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resumeAnimation = () => {
    setIsPaused(false);
    animate();
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (avatarInstance.current) {
      avatarInstance.current.reset();
      avatarInstance.current.render();
    }
  };

  const generateCode = () => {
    const dataAttributes = [];
    if (hotel) dataAttributes.push(`data-hotel="${hotel}"`);
    if (nickname) dataAttributes.push(`data-nickname="${nickname}"`);
    if (figure) dataAttributes.push(`data-figure="${figure}"`);
    dataAttributes.push(`data-sequence="${currentSequence.name.toLowerCase()}"`);
    
    const html = `<div class="animated-avatar" ${dataAttributes.join(' ')}></div>`;
    
    const sequenceCode = `const sequences = {
  '${currentSequence.name.toLowerCase()}': Object.freeze([
    ${currentSequence.steps.map(step => {
      if (step.type === 'delay') {
        return step.value;
      } else if (step.type === 'action') {
        return `a => a.${step.value} = ${step.duration || 'Infinity'}`;
      } else if (step.type === 'direction') {
        return `a => a.direction = ${JSON.stringify(step.value)}`;
      } else if (step.type === 'gesture') {
        return `a => a.gesture = '${step.value}'`;
      }
      return step.value;
    }).join(',\n    ')}
  ])
};`;
    
    setGeneratedCode(`${html}\n\n${sequenceCode}`);
  };

  const saveSequence = () => {
    const newSequence = { ...currentSequence, id: Date.now().toString() };
    setSequences(prev => [...prev, newSequence]);
  };

  const loadSequence = (sequence: Sequence) => {
    setCurrentSequence(sequence);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gerador de Animações de Avatar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações do Avatar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hotel">Hotel</Label>
              <Select value={hotel} onValueChange={setHotel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="com.br">Habbo.com.br</SelectItem>
                  <SelectItem value="com">Habbo.com</SelectItem>
                  <SelectItem value="com.tr">Habbo.com.tr</SelectItem>
                  <SelectItem value="de">Habbo.de</SelectItem>
                  <SelectItem value="es">Habbo.es</SelectItem>
                  <SelectItem value="fi">Habbo.fi</SelectItem>
                  <SelectItem value="fr">Habbo.fr</SelectItem>
                  <SelectItem value="it">Habbo.it</SelectItem>
                  <SelectItem value="nl">Habbo.nl</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Digite o nickname"
              />
            </div>
            
            <div>
              <Label htmlFor="figure">Figure String</Label>
              <Input
                id="figure"
                value={figure}
                onChange={(e) => setFigure(e.target.value)}
                placeholder="hr-893-61.hd-180-1..."
              />
            </div>
          </div>

          {/* Preview do Avatar */}
          <div className="flex justify-center">
            <div 
              ref={avatarRef}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center"
              data-hotel={hotel}
              data-nickname={nickname || undefined}
              data-figure={figure || undefined}
            />
          </div>

          {/* Controles de Animação */}
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={playAnimation}
              disabled={isPlaying && !isPaused}
              variant="default"
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
            
            {isPlaying && !isPaused ? (
              <Button onClick={pauseAnimation} variant="outline">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : isPaused ? (
              <Button onClick={resumeAnimation} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            ) : null}
            
            <Button onClick={stopAnimation} variant="outline">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
            
            <Button onClick={() => avatarInstance.current?.reset()} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Status da Animação */}
          {isPlaying && (
            <div className="text-center">
              <Badge variant="secondary">
                Passo {currentStep} de {currentSequence.steps.length}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor de Sequência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Editor de Sequência</span>
            <div className="flex gap-2">
              <Button onClick={saveSequence} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={generateCode} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Gerar Código
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome da Sequência */}
          <div>
            <Label htmlFor="sequenceName">Nome da Sequência</Label>
            <Input
              id="sequenceName"
              value={currentSequence.name}
              onChange={(e) => setCurrentSequence(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da sequência"
            />
          </div>

          {/* Botões para Adicionar Passos */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => addStep('action')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Ação
            </Button>
            <Button onClick={() => addStep('direction')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Direção
            </Button>
            <Button onClick={() => addStep('gesture')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Gesto
            </Button>
            <Button onClick={() => addStep('delay')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Delay
            </Button>
          </div>

          {/* Lista de Passos */}
          <div className="space-y-2">
            {currentSequence.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 p-2 border rounded">
                <Badge variant="outline">{index + 1}</Badge>
                
                <Select
                  value={step.type}
                  onValueChange={(value) => updateStep(step.id, 'type', value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="action">Ação</SelectItem>
                    <SelectItem value="direction">Direção</SelectItem>
                    <SelectItem value="gesture">Gesto</SelectItem>
                    <SelectItem value="delay">Delay</SelectItem>
                  </SelectContent>
                </Select>

                {step.type === 'action' && (
                  <>
                    <Select
                      value={step.value}
                      onValueChange={(value) => updateStep(step.id, 'value', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walk">Walk</SelectItem>
                        <SelectItem value="wave">Wave</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={step.duration || 2}
                      onChange={(e) => updateStep(step.id, 'duration', parseFloat(e.target.value))}
                      placeholder="Duração"
                      className="w-20"
                    />
                  </>
                )}

                {step.type === 'direction' && (
                  <Input
                    type="number"
                    value={Array.isArray(step.value) ? step.value[0] : step.value}
                    onChange={(e) => updateStep(step.id, 'value', parseInt(e.target.value))}
                    placeholder="Direção (0-7)"
                    className="w-20"
                    min="0"
                    max="7"
                  />
                )}

                {step.type === 'gesture' && (
                  <Select
                    value={step.value}
                    onValueChange={(value) => updateStep(step.id, 'value', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sml">Smile</SelectItem>
                      <SelectItem value="srp">Surprised</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="agr">Angry</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {step.type === 'delay' && (
                  <Input
                    type="number"
                    value={step.value}
                    onChange={(e) => updateStep(step.id, 'value', parseFloat(e.target.value))}
                    placeholder="Segundos"
                    className="w-20"
                    step="0.1"
                  />
                )}

                <Button
                  onClick={() => removeStep(step.id)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sequências Salvas */}
      <Card>
        <CardHeader>
          <CardTitle>Sequências Salvas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {sequences.map((sequence) => (
              <div key={sequence.id} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{sequence.name}</span>
                <Button
                  onClick={() => loadSequence(sequence)}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Código Gerado */}
      {generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle>Código Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedCode}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
            <Button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              variant="outline"
              className="mt-2"
            >
              Copiar Código
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
