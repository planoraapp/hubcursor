
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, DollarSign, Users } from 'lucide-react';

const Mercado = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-emerald-100">
        <NewAppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-green-900 mb-4 volter-font">
                🏢 Mercado Habbo
              </h1>
              <p className="text-lg text-green-700 volter-font">
                Compre, venda e negocie itens com outros usuários!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">1,247</div>
                  <div className="text-sm text-green-700">Itens à Venda</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">532</div>
                  <div className="text-sm text-blue-700">Vendedores Ativos</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-900">89,432</div>
                  <div className="text-sm text-yellow-700">Moedas Negociadas</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">156</div>
                  <div className="text-sm text-purple-700">Negociações Hoje</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="volter-font">🚧 Em Desenvolvimento</CardTitle>
                <CardDescription>
                  O sistema de mercado está sendo desenvolvido. Em breve você poderá:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Comprar e vender mobílias</li>
                  <li>Negociar itens raros</li>
                  <li>Criar leilões</li>
                  <li>Sistema de avaliações</li>
                  <li>Histórico de transações</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Mercado;
