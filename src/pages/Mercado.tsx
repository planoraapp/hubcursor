
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, TrendingUp, User, Clock } from 'lucide-react';

const Mercado = () => {
  const marketItems = [
    {
      id: 1,
      name: 'Widget Raridade Suprema',
      description: 'Widget exclusivo com animações especiais para sua home',
      price: 2500,
      originalPrice: 3000,
      seller: 'UsuarioVIP',
      timeLeft: '2d 5h',
      rarity: 'Lendário',
      image: '/assets/home.png'
    },
    {
      id: 2,
      name: 'Background Colecionável',
      description: 'Papel de parede de edição limitada do evento de inverno',
      price: 1200,
      originalPrice: null,
      seller: 'ColecHabbo',
      timeLeft: '1d 12h',
      rarity: 'Épico',
      image: '/assets/news.png'
    },
    {
      id: 3,
      name: 'Conjunto de Stickers',
      description: 'Pack com 20 stickers temáticos para decoração',
      price: 750,
      originalPrice: 900,
      seller: 'StickerMaster',
      timeLeft: '6h 30m',
      rarity: 'Raro',
      image: '/assets/emblemas.png'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Lendário': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Épico': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Raro': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewAppSidebar />
        <main 
          className="flex-1 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-blue-900/30"></div>
          
          <div className="relative z-10 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                  🏪 Mercado HabboHub
                </h1>
                <p className="text-xl text-white/90 volter-font drop-shadow">
                  Compre, venda e troque itens exclusivos com outros usuários
                </p>
              </div>

              {/* Search Bar */}
              <Card className="mb-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar itens no mercado..."
                        className="pl-10 volter-font"
                      />
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white volter-font">
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Badge variant="outline" className="volter-font cursor-pointer hover:bg-gray-100">
                      Todos
                    </Badge>
                    <Badge variant="outline" className="volter-font cursor-pointer hover:bg-gray-100">
                      Widgets
                    </Badge>
                    <Badge variant="outline" className="volter-font cursor-pointer hover:bg-gray-100">
                      Backgrounds
                    </Badge>
                    <Badge variant="outline" className="volter-font cursor-pointer hover:bg-gray-100">
                      Stickers
                    </Badge>
                    <Badge variant="outline" className="volter-font cursor-pointer hover:bg-gray-100">
                      Emblemas
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Market Items */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {marketItems.map((item) => (
                  <Card key={item.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                    <CardHeader className={`${getRarityColor(item.rarity)} text-white border-b-2 border-black`}>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg volter-font">
                          {item.name}
                        </CardTitle>
                        <Badge className="bg-white/20 text-white volter-font">
                          {item.rarity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 mx-auto mb-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/frank.png';
                          }}
                        />
                      </div>
                      
                      <p className="text-gray-600 mb-4 volter-font text-sm">
                        {item.description}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 volter-font">Vendedor:</span>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="text-sm font-semibold volter-font">{item.seller}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 volter-font">Tempo restante:</span>
                          <div className="flex items-center gap-1 text-red-600">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm font-semibold volter-font">{item.timeLeft}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through volter-font">
                              {item.originalPrice} pontos
                            </span>
                          )}
                          <span className="text-2xl font-bold text-green-600 volter-font">
                            {item.price} pontos
                          </span>
                        </div>
                        
                        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white volter-font">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar Agora
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Market Stats */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-b-2 border-black">
                    <CardTitle className="volter-font flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Itens em Alta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="volter-font">Widgets Animados</span>
                        <Badge className="bg-green-100 text-green-800 volter-font">+25%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="volter-font">Backgrounds Raros</span>
                        <Badge className="bg-green-100 text-green-800 volter-font">+18%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="volter-font">Stickers Limitados</span>
                        <Badge className="bg-green-100 text-green-800 volter-font">+12%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-b-2 border-black">
                    <CardTitle className="volter-font">Como Vender</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 text-sm volter-font">
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Acesse seu inventário de itens</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                        <span>Selecione o item que deseja vender</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                        <span>Defina um preço competitivo</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                        <span>Publique no mercado e aguarde</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 volter-font">
                      Vender Meus Itens
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Mercado;
