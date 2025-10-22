import React from 'react';
import { Link } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Star } from 'lucide-react';
import PageBanner from '@/components/ui/PageBanner';
import { AccentFixedText } from '@/components/AccentFixedText';
import { useI18n } from '@/contexts/I18nContext';

// Temporariamente desabilitar hooks pesados para melhorar performance
// import { useInitializeUserFeed } from '@/hooks/useInitializeUserFeed';
// import { useHabboFurniApi } from '@/hooks/useHabboFurniApi';
// import { useUnifiedClothingAPI } from '@/hooks/useUnifiedClothingAPI';
// import { useHomeAssets } from '@/hooks/useHomeAssets';

export const Home: React.FC = () => {
  const { t } = useI18n();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main 
            className="flex-1 p-8 min-h-screen"
            style={{ 
              backgroundImage: 'url(/assets/bghabbohub.png)',
              backgroundRepeat: 'repeat'
            }}
          >
            <div className="max-w-7xl mx-auto">
              {/* Banner padrão com fundo de nuvens */}
              <PageBanner 
                title="🏠 HabboHub"
                subtitle={t('pages.home.subtitle')}
              />

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-b-2 border-black">
                    <CardTitle className="flex items-center gap-2 sidebar-font-option-4 text-white"
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px',
                        textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
                      }}>
                      <Users className="w-5 h-5 text-white" />
                      {t('pages.home.console.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 volter-body-text">
                      <AccentFixedText>{t('pages.home.console.description')}</AccentFixedText>
                    </p>
                    <Link to="/console">
                      <Button className="w-full habbo-button-blue sidebar-font-option-4"
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          letterSpacing: '0.3px'
                        }}>{t('pages.home.console.button')}</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-b-2 border-black">
                    <CardTitle className="flex items-center gap-2 sidebar-font-option-4 text-white"
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px'
                      }}>
                      <MessageSquare className="w-5 h-5 text-white" />
                      {t('pages.home.homes.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 volter-body-text">
                      <AccentFixedText>{t('pages.home.homes.description')}</AccentFixedText>
                    </p>
                    <Link to="/homes">
                      <Button className="w-full habbo-button-green sidebar-font-option-4"
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          letterSpacing: '0.3px'
                        }}>{t('pages.home.homes.button')}</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black">
                  <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-b-2 border-black">
                    <CardTitle className="flex items-center gap-2 sidebar-font-option-4 text-white"
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px'
                      }}>
                      <Star className="w-5 h-5 text-white" />
                      {t('pages.home.tools.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 volter-body-text">
                      <AccentFixedText>{t('pages.home.tools.description')}</AccentFixedText>
                    </p>
                    <Link to="/emblemas">
                      <Button className="w-full habbo-button-yellow sidebar-font-option-4"
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          letterSpacing: '0.3px'
                        }}>{t('pages.home.tools.button')}</Button>
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
                    <p className="text-gray-600 mb-6 volter-body-text">
                      <AccentFixedText>Explore todas as funcionalidades do HabboHub e conecte-se com a maior comunidade Habbo do Brasil.</AccentFixedText>
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Link to="/console">
                        <Button size="lg" className="habbo-button-blue sidebar-font-option-4"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            letterSpacing: '0.3px'
                          }}>Explorar Console</Button>
                      </Link>
                      <Link to="/homes">
                        <Button size="lg" className="habbo-button-green sidebar-font-option-4"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            letterSpacing: '0.3px'
                          }}>Ver Homes</Button>
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