
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Star, Gift, Sparkles } from 'lucide-react';

const Catalogo = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-cyan-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-blue-900 mb-4 volter-font">
                🛍️ Catálogo Habbo
              </h1>
              <p className="text-lg text-blue-700 volter-font">
                Descubra mobílias, roupas e itens exclusivos!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    Mobílias
                  </CardTitle>
                  <CardDescription>Decore seu quarto com os melhores móveis</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Em breve disponível!</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Roupas
                  </CardTitle>
                  <CardDescription>Vista seu Habbo com estilo único</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Em breve disponível!</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 volter-font">
                    <Gift className="w-5 h-5 text-green-600" />
                    Raros
                  </CardTitle>
                  <CardDescription>Itens exclusivos e limitados</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Em breve disponível!</p>
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
