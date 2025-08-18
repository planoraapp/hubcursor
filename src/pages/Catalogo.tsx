
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star, Coins } from 'lucide-react';

const Catalogo = () => {
  const mockItems = [
    {
      id: 1,
      name: 'Emblema Especial',
      description: 'Emblema exclusivo da comunidade HabboHub',
      price: 100,
      category: 'Emblemas',
      rarity: 'Raro',
      image: '/assets/emblemas.png'
    },
    {
      id: 2,
      name: 'Widget Premium',
      description: 'Widget especial para sua Habbo Home',
      price: 50,
      category: 'Widgets',
      rarity: 'Comum',
      image: '/assets/home.png'
    },
    {
      id: 3,
      name: 'Background Exclusivo',
      description: 'Papel de parede limitado para sua home',
      price: 75,
      category: 'Backgrounds',
      rarity: 'Épico',
      image: '/assets/news.png'
    }
  ];

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
                  🛍️ Catálogo HabboHub
                </h1>
                <p className="text-xl text-white/90 volter-font drop-shadow">
                  Descubra itens exclusivos para personalizar sua experiência
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockItems.map((item) => (
                  <Card key={item.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-b-2 border-black">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl volter-font">
                          {item.name}
                        </CardTitle>
                        <Badge variant={item.rarity === 'Raro' ? 'default' : item.rarity === 'Épico' ? 'destructive' : 'secondary'} className="volter-font">
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
                      
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="volter-font">
                          {item.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Coins className="w-4 h-4" />
                          <span className="font-bold volter-font">{item.price}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white volter-font">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 volter-font">
                    💰 Sistema de Pontos
                  </h3>
                  <p className="text-gray-600 mb-6 volter-font">
                    Ganhe pontos participando da comunidade e utilize-os para comprar itens exclusivos!
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <h4 className="font-bold volter-font">Postar no Fórum</h4>
                      <p className="text-sm text-gray-600 volter-font">+10 pontos</p>
                    </div>
                    <div className="text-center">
                      <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <h4 className="font-bold volter-font">Visitar Homes</h4>
                      <p className="text-sm text-gray-600 volter-font">+5 pontos</p>
                    </div>
                    <div className="text-center">
                      <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <h4 className="font-bold volter-font">Login Diário</h4>
                      <p className="text-sm text-gray-600 volter-font">+20 pontos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Catalogo;
