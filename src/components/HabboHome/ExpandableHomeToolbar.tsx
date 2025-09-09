import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useHomeAssets } from '@/hooks/useHomeAssets';

interface ExpandableHomeToolbarProps {
  onBackgroundChange?: (type: 'color' | 'cover' | 'repeat', value: string) => void;
  onStickerAdd?: (stickerId: string, stickerSrc: string, category: string) => void;
  onWidgetAdd?: (widgetType: string) => Promise<boolean>;
  onSave?: () => void;
  onToggleEditMode?: () => void;
}

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
  const [activeStickerTab, setActiveStickerTab] = useState<'Stickers' | 'Mockups' | 'Montáveis' | 'Ícones' | 'Animados'>('Stickers');
  const { assets, loading } = useHomeAssets();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExpandedSection(null);
      }
    };

    if (expandedSection) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedSection]);

  const handleBackgroundSelect = (background: any) => {
    if (onBackgroundChange) {
      // Determinar se é repeat baseado no nome ou categoria
      const isRepeat = background.name.toLowerCase().includes('padrão') || 
                      background.name.toLowerCase().includes('pattern') ||
                      background.category === 'Papel de Parede';
      onBackgroundChange(isRepeat ? 'repeat' : 'cover', background.url);
    }
    // Não fechar o dropdown ao selecionar background
  };

  const handleStickerSelect = (sticker: any) => {
    if (onStickerAdd) {
      // Adicionar sticker no canto superior esquerdo (posição 20, 20)
      onStickerAdd(sticker.id, sticker.url, sticker.category);
    }
    // Minimizar dropdown (fechar apenas a seção de stickers)
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
    <div ref={dropdownRef} className="bg-white text-gray-800 rounded-lg border-2 border-black shadow-lg">
      {/* Linha principal com botões de categorias e ações */}
      <div className="p-3">
        <div className="flex gap-2 items-center">
          {/* Botões de Categorias */}
          <Button
            onClick={() => toggleSection('backgrounds')}
            className={`px-4 py-2 font-bold volter-font border-2 border-black rounded transition-all duration-200 hover:scale-105 ${
              expandedSection === 'backgrounds' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            🖼️ Background
            {expandedSection === 'backgrounds' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>

          <Button
            onClick={() => toggleSection('stickers')}
            className={`px-4 py-2 font-bold volter-font border-2 border-black rounded transition-all duration-200 hover:scale-105 ${
              expandedSection === 'stickers' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            ✨ Stickers
            {expandedSection === 'stickers' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>

          <Button
            onClick={() => toggleSection('widgets')}
            className={`px-4 py-2 font-bold volter-font border-2 border-black rounded transition-all duration-200 hover:scale-105 ${
              expandedSection === 'widgets' 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold volter-font border-2 border-black rounded transition-all duration-200 hover:scale-105"
            >
              💾 Salvar
            </Button>
          )}

          {onToggleEditMode && (
            <Button
              onClick={onToggleEditMode}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold volter-font border-2 border-black rounded transition-all duration-200 hover:scale-105"
            >
              ❌ Sair
            </Button>
          )}
        </div>
      </div>

      {/* Área de Dropdown - Expansão da toolbar */}
      {expandedSection && (
        <div className="border-t border-black bg-white">
          <div className="p-6">
            {expandedSection === 'backgrounds' && (
              <div>
                <h3 className="font-bold mb-4 volter-font text-gray-800">Escolher Background</h3>
                <ScrollArea className="h-64">
                  <div className="grid grid-cols-3 gap-4">
                    {loading ? (
                      <div className="col-span-3 text-center text-gray-800 volter-font">Carregando backgrounds...</div>
                    ) : (
                      assets['Papel de Parede'].map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => handleBackgroundSelect(bg)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-full h-20 bg-cover bg-center" style={{ backgroundImage: `url(${bg.url})` }} />
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {expandedSection === 'stickers' && (
              <div>
                <h3 className="font-bold mb-4 volter-font text-gray-800">Escolher Sticker</h3>
                
                {/* Abas dos Stickers */}
                <div className="flex gap-1 mb-4 border-b border-gray-300">
                  {(['Stickers', 'Mockups', 'Montáveis', 'Ícones', 'Animados'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveStickerTab(tab)}
                      className={`px-3 py-2 text-sm font-medium volter-font border-b-2 transition-colors ${
                        activeStickerTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <ScrollArea className="h-64">
                  {loading ? (
                    <div className="text-center text-gray-800 volter-font">Carregando stickers...</div>
                  ) : (
                    <div className="grid grid-cols-8 gap-2">
                      {assets[activeStickerTab]?.map((sticker) => (
                        <button
                          key={sticker.id}
                          onClick={() => handleStickerSelect(sticker)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          title={sticker.name}
                        >
                          <div className="w-16 h-16 bg-cover bg-center mx-auto" style={{ backgroundImage: `url(${sticker.url})` }} />
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {expandedSection === 'widgets' && (
              <div>
                <h3 className="font-bold mb-4 volter-font text-gray-800">Escolher Widget</h3>
                <div className="grid grid-cols-1 gap-4">
                  {WIDGETS.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => handleWidgetSelect(widget)}
                      className="w-full p-5 text-left hover:bg-gray-100 rounded border border-gray-300 transition-colors bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{widget.icon}</span>
                        <div>
                          <div className="font-bold volter-font text-lg text-gray-800">{widget.name}</div>
                          <div className="text-sm text-gray-600 volter-font">{widget.description}</div>
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
