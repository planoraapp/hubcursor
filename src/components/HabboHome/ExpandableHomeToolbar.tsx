import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableHomeToolbarProps {
  onBackgroundChange?: (type: 'color' | 'cover' | 'repeat', value: string) => void;
  onStickerAdd?: (stickerId: string, stickerSrc: string, category: string) => void;
  onWidgetAdd?: (widgetType: string) => Promise<boolean>;
  onSave?: () => void;
  onToggleEditMode?: () => void;
}

// Assets mockados - em produção virão do Supabase
const BACKGROUNDS = [
  { id: 'bg1', name: 'Céu Azul', src: '/assets/backgrounds/sky-blue.png', type: 'cover' },
  { id: 'bg2', name: 'Floresta', src: '/assets/backgrounds/forest.png', type: 'cover' },
  { id: 'bg3', name: 'Cidade', src: '/assets/backgrounds/city.png', type: 'cover' },
  { id: 'bg4', name: 'Praia', src: '/assets/backgrounds/beach.png', type: 'cover' },
  { id: 'bg5', name: 'Espaço', src: '/assets/backgrounds/space.png', type: 'cover' },
  { id: 'bg6', name: 'Padrão 1', src: '/assets/backgrounds/pattern1.png', type: 'repeat' },
  { id: 'bg7', name: 'Padrão 2', src: '/assets/backgrounds/pattern2.png', type: 'repeat' },
];

const STICKERS = [
  { id: 'sticker1', name: 'Coração', src: '/assets/stickers/heart.png', category: 'emotions' },
  { id: 'sticker2', name: 'Estrela', src: '/assets/stickers/star.png', category: 'shapes' },
  { id: 'sticker3', name: 'Smile', src: '/assets/stickers/smile.png', category: 'emotions' },
  { id: 'sticker4', name: 'Círculo', src: '/assets/stickers/circle.png', category: 'shapes' },
  { id: 'sticker5', name: 'Diamante', src: '/assets/stickers/diamond.png', category: 'shapes' },
  { id: 'sticker6', name: 'Flor', src: '/assets/stickers/flower.png', category: 'nature' },
  { id: 'sticker7', name: 'Árvore', src: '/assets/stickers/tree.png', category: 'nature' },
  { id: 'sticker8', name: 'Casa', src: '/assets/stickers/house.png', category: 'objects' },
  { id: 'sticker9', name: 'Carro', src: '/assets/stickers/car.png', category: 'objects' },
  { id: 'sticker10', name: 'Avião', src: '/assets/stickers/plane.png', category: 'objects' },
];

const WIDGETS = [
  { id: 'profile', name: 'Card de Perfil', description: 'Mostra avatar e informações do usuário', icon: '👤' },
  { id: 'guestbook', name: 'Livro de Visitas', description: 'Permite visitantes deixarem mensagens', icon: '📖' },
  { id: 'rating', name: 'Avaliações', description: 'Sistema de like/dislike da home', icon: '⭐' },
];

export const ExpandableHomeToolbar: React.FC<ExpandableHomeToolbarProps> = ({
  onBackgroundChange,
  onStickerAdd,
  onWidgetAdd,
  onSave,
  onToggleEditMode
}) => {
  const [expandedSection, setExpandedSection] = useState<'backgrounds' | 'stickers' | 'widgets' | null>(null);

  const handleBackgroundSelect = (background: typeof BACKGROUNDS[0]) => {
    if (onBackgroundChange) {
      onBackgroundChange(background.type as 'color' | 'cover' | 'repeat', background.src);
    }
    setExpandedSection(null);
  };

  const handleStickerSelect = (sticker: typeof STICKERS[0]) => {
    if (onStickerAdd) {
      // Posição aleatória no canvas
      const x = Math.random() * (1080 - 100) + 50;
      const y = Math.random() * (1800 - 100) + 50;
      onStickerAdd(sticker.id, sticker.src, sticker.category);
    }
    setExpandedSection(null);
  };

  const handleWidgetSelect = async (widget: typeof WIDGETS[0]) => {
    if (onWidgetAdd) {
      await onWidgetAdd(widget.id);
    }
    setExpandedSection(null);
  };

  const toggleSection = (section: 'backgrounds' | 'stickers' | 'widgets') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-sidebar text-sidebar-foreground rounded-lg border-2 border-sidebar-border shadow-lg">
      {/* Linha principal com botões de categorias e ações */}
      <div className="p-3">
        <div className="flex gap-2 items-center">
          {/* Botões de Categorias */}
          <Button
            onClick={() => toggleSection('backgrounds')}
            className={`px-4 py-2 font-bold volter-font border-2 border-sidebar-border rounded transition-all duration-200 hover:scale-105 ${
              expandedSection === 'backgrounds' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-accent-foreground'
            }`}
          >
            🖼️ Background
            {expandedSection === 'backgrounds' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>

          <Button
            onClick={() => toggleSection('stickers')}
            className={`px-4 py-2 font-bold volter-font border-2 border-sidebar-border rounded transition-all duration-200 hover:scale-105 ${
              expandedSection === 'stickers' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-accent-foreground'
            }`}
          >
            ✨ Stickers
            {expandedSection === 'stickers' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>

          <Button
            onClick={() => toggleSection('widgets')}
            className={`px-4 py-2 font-bold volter-font border-2 border-sidebar-border rounded transition-all duration-200 hover:scale-105 ${
              expandedSection === 'widgets' 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-accent-foreground'
            }`}
          >
            📦 Widgets
            {expandedSection === 'widgets' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>

          {/* Espaçador para empurrar botões de ação para a direita */}
          <div className="flex-1" />

          {/* Botões de Ação */}
          {onSave && (
            <Button
              onClick={onSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold volter-font border-2 border-sidebar-border rounded transition-all duration-200 hover:scale-105"
            >
              💾 Salvar
            </Button>
          )}

          {onToggleEditMode && (
            <Button
              onClick={onToggleEditMode}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold volter-font border-2 border-sidebar-border rounded transition-all duration-200 hover:scale-105"
            >
              ❌ Sair
            </Button>
          )}
        </div>
      </div>

      {/* Área de Dropdown - Expansão da toolbar */}
      {expandedSection && (
        <div className="border-t border-sidebar-border bg-sidebar-accent/20">
          <div className="p-6">
            {expandedSection === 'backgrounds' && (
              <div>
                <h3 className="font-bold mb-4 volter-font text-sidebar-foreground">Escolher Background</h3>
                <ScrollArea className="h-64">
                  <div className="grid grid-cols-3 gap-4">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => handleBackgroundSelect(bg)}
                        className="p-4 text-left hover:bg-sidebar-accent rounded border border-sidebar-border transition-colors bg-sidebar-accent/30"
                      >
                        <div className="w-full h-20 bg-cover bg-center rounded mb-3" style={{ backgroundImage: `url(${bg.src})` }} />
                        <div className="text-sm volter-font font-medium text-sidebar-foreground">{bg.name}</div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {expandedSection === 'stickers' && (
              <div>
                <h3 className="font-bold mb-4 volter-font text-sidebar-foreground">Escolher Sticker</h3>
                <ScrollArea className="h-64">
                  <div className="grid grid-cols-8 gap-3">
                    {STICKERS.map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() => handleStickerSelect(sticker)}
                        className="p-3 text-center hover:bg-sidebar-accent rounded border border-sidebar-border transition-colors bg-sidebar-accent/30"
                        title={sticker.name}
                      >
                        <div className="w-16 h-16 bg-cover bg-center mx-auto mb-2" style={{ backgroundImage: `url(${sticker.src})` }} />
                        <div className="text-xs volter-font font-medium text-sidebar-foreground">{sticker.name}</div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {expandedSection === 'widgets' && (
              <div>
                <h3 className="font-bold mb-4 volter-font text-sidebar-foreground">Escolher Widget</h3>
                <div className="grid grid-cols-1 gap-4">
                  {WIDGETS.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => handleWidgetSelect(widget)}
                      className="w-full p-5 text-left hover:bg-sidebar-accent rounded border border-sidebar-border transition-colors bg-sidebar-accent/30"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{widget.icon}</span>
                        <div>
                          <div className="font-bold volter-font text-lg text-sidebar-foreground">{widget.name}</div>
                          <div className="text-sm text-sidebar-foreground/70 volter-font">{widget.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
