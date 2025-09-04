import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HubHomeAssetsProps {
  type: 'stickers' | 'widgets' | 'backgrounds';
  onSelect: (asset: any) => void;
  onClose: () => void;
}

interface Asset {
  id: string;
  name: string;
  src: string;
  category: string;
  type: string;
}

export const HubHomeAssets: React.FC<HubHomeAssetsProps> = ({
  type,
  onSelect,
  onClose
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [type]);

  const loadAssets = async () => {
    setLoading(true);
    
    try {
      const mockAssets: Asset[] = [];
      
      if (type === 'stickers') {
        // Stickers - Usando assets reais das pastas existentes
        mockAssets.push(
          { id: 'sticker-smile', name: '😊 Smile', src: '/assets/home/stickers/emoticons/smile.png', category: 'emoticons', type: 'sticker' },
          { id: 'sticker-heart', name: '❤️ Heart', src: '/assets/home/stickers/emoticons/heart.png', category: 'emoticons', type: 'sticker' },
          { id: 'sticker-star', name: '⭐ Star', src: '/assets/home/stickers/decorative/star.png', category: 'decorative', type: 'sticker' },
          { id: 'sticker-welcome', name: '👋 Welcome', src: '/assets/home/stickers/text/welcome.png', category: 'text', type: 'sticker' },
          { id: 'sticker-cool', name: '😎 Cool', src: '/assets/home/stickers/emoticons/cool.png', category: 'emoticons', type: 'sticker' },
          { id: 'sticker-flower', name: '🌸 Flower', src: '/assets/home/stickers/decorative/flower.png', category: 'decorative', type: 'sticker' },
          { id: 'sticker-music', name: '🎵 Music', src: '/assets/home/stickers/decorative/music.png', category: 'decorative', type: 'sticker' },
          { id: 'sticker-games', name: '🎮 Games', src: '/assets/home/stickers/decorative/games.png', category: 'decorative', type: 'sticker' }
        );
      } else if (type === 'widgets') {
        // Widgets - Baseado nos widgets que já existem na sua home
        mockAssets.push(
          { id: 'widget-avatar', name: '👤 Card de Perfil', src: '/assets/home/widgets/icons/avatar.png', category: 'profile', type: 'widget' },
          { id: 'widget-guestbook', name: '📖 Livro de Visitas', src: '/assets/home/widgets/icons/guestbook.png', category: 'social', type: 'widget' },
          { id: 'widget-rating', name: '⭐ Sistema de Avaliação', src: '/assets/home/widgets/icons/rating.png', category: 'social', type: 'widget' },
          { id: 'widget-info', name: 'ℹ️ Informações', src: '/assets/home/widgets/icons/info.png', category: 'profile', type: 'widget' },
          { id: 'widget-stats', name: '📊 Estatísticas', src: '/assets/home/widgets/icons/stats.png', category: 'profile', type: 'widget' },
          { id: 'widget-friends', name: '👥 Amigos', src: '/assets/home/widgets/icons/friends.png', category: 'social', type: 'widget' }
        );
      } else if (type === 'backgrounds') {
        // Backgrounds - Usando cores e padrões reais
        mockAssets.push(
          { id: 'bg-blue', name: '🔵 Azul Suave', src: '/assets/home/backgrounds/solid-colors/blue.png', category: 'colors', type: 'background' },
          { id: 'bg-pink', name: '🩷 Rosa Suave', src: '/assets/home/backgrounds/solid-colors/pink.png', category: 'colors', type: 'background' },
          { id: 'bg-green', name: '🟢 Verde Suave', src: '/assets/home/backgrounds/solid-colors/green.png', category: 'colors', type: 'background' },
          { id: 'bg-purple', name: '🟣 Roxo Suave', src: '/assets/home/backgrounds/solid-colors/purple.png', category: 'colors', type: 'background' },
          { id: 'bg-yellow', name: '🟡 Amarelo Suave', src: '/assets/home/backgrounds/solid-colors/yellow.png', category: 'colors', type: 'background' },
          { id: 'bg-pattern-1', name: '🔶 Padrão Geométrico', src: '/assets/home/backgrounds/patterns/pattern1.png', category: 'patterns', type: 'background' },
          { id: 'bg-pattern-2', name: '🔷 Padrão Floral', src: '/assets/home/backgrounds/patterns/pattern2.png', category: 'patterns', type: 'background' },
          { id: 'bg-space', name: '🚀 Espaço', src: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/backgroundshome/groupbg_scifi_space2.gif', category: 'images', type: 'background' },
          { id: 'bg-nature', name: '🌿 Natureza', src: '/assets/home/backgrounds/images/nature.png', category: 'images', type: 'background' },
          { id: 'bg-city', name: '🏙️ Cidade', src: '/assets/home/backgrounds/images/city.png', category: 'images', type: 'background' }
        );
      }
      
      setAssets(mockAssets);
    } catch (error) {
      console.error('Erro ao carregar assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'emoticons': 'Emoticons',
      'text': 'Texto',
      'decorative': 'Decorativo',
      'profile': 'Perfil',
      'social': 'Social',
      'colors': 'Cores',
      'patterns': 'Padrões',
      'images': 'Imagens'
    };
    return categories[category] || category;
  };

  const handleAssetSelect = (asset: Asset) => {
    onSelect(asset);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl border-2 border-black">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 volter-font">Carregando assets...</p>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(assets.map(asset => asset.category))];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 shadow-xl border-2 border-black max-h-[80vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 volter-font">
            {type === 'stickers' && '✨ Stickers'}
            {type === 'widgets' && '📦 Widgets'}
            {type === 'backgrounds' && '🖼️ Backgrounds'}
          </h2>
          <Button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white volter-font"
          >
            ❌ Fechar
          </Button>
        </div>

        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="volter-font">
                {getCategoryName(category)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                  {assets
                    .filter(asset => asset.category === category)
                    .map(asset => (
                      <Card
                        key={asset.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-blue-400"
                        onClick={() => handleAssetSelect(asset)}
                      >
                        <CardHeader className="p-3">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                            <img
                              src={asset.src}
                              alt={asset.name}
                              className="w-16 h-16 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/home/widgets/icons/default.png';
                              }}
                            />
                          </div>
                          <CardTitle className="text-sm text-center volter-font">
                            {asset.name}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
