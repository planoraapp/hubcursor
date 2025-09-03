
import React from 'react';
import { Link } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home as HomeIcon, Users, MessageSquare, Star } from 'lucide-react';
import { OpenConsolePopupButton } from '@/components/OpenConsolePopupButton';
import PageBanner from '@/components/ui/PageBanner';

export const Home: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 bg-repeat min-h-screen" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-7xl mx-auto">
              <PageBanner 
                title="🏠 HabboHub"
                subtitle="A plataforma definitiva para a comunidade Habbo. Conecte-se, explore e compartilhe sua paixão pelo Habbo Hotel."
                backgroundImage="/assets/gcreate_1_1.png"
              />

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-b-2 border-black">
                    <CardTitle className="flex items-center gap-2 volter-font">
                      <Users className="w-5 h-5 text-white" />
                      Console Social
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 volter-font">
                      Acesse o console social para ver fotos de amigos, buscar usuários e interagir com a comunidade.
                    </p>
                    <Link to="/console">
                      <Button className="w-full habbo-button-blue volter-font">Acessar Console</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-b-2 border-black">
                    <CardTitle className="flex items-center gap-2 volter-font">
                      <MessageSquare className="w-5 h-5 text-white" />
                      Habbo Homes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 volter-font">
                      Explore as homes dos usuários, crie conexões e descubra conteúdos incríveis da comunidade.
                    </p>
                    <Link to="/homes">
                      <Button className="w-full habbo-button-green volter-font">Ver Homes</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-b-2 border-black">
                    <CardTitle className="flex items-center gap-2 volter-font">
                      <Star className="w-5 h-5 text-white" />
                      Emblemas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 volter-font">
                      Descubra e colecione emblemas exclusivos, veja rankings e conquiste seu lugar na comunidade.
                    </p>
                    <Link to="/emblemas">
                      <Button className="w-full habbo-button-yellow volter-font">Ver Emblemas</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2 border-black">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 volter-font"
                        style={{
                          textShadow: '1px 1px 0px rgba(0,0,0,0.3)'
                        }}>
                      Pronto para começar?
                    </h3>
                    <p className="text-gray-600 mb-6 volter-font">
                      Explore todas as funcionalidades do HabboHub e conecte-se com a maior comunidade Habbo do Brasil.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Link to="/console">
                        <Button size="lg" className="habbo-button-blue volter-font">Explorar Console</Button>
                      </Link>
                      <OpenConsolePopupButton />
                      <Link to="/homes">
                        <Button size="lg" className="habbo-button-green volter-font">Ver Homes</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Home;
