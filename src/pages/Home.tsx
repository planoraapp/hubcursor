import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, MessageSquare, Star } from 'lucide-react';
import PageBanner from '@/components/ui/PageBanner';
import { AccentFixedText } from '@/components/AccentFixedText';
import { useI18n } from '@/contexts/I18nContext';
import { getBannerImageBySeed } from '@/utils/bannerUtils';
import { Footer } from '@/components/Footer';

// Temporariamente desabilitar hooks pesados para melhorar performance
// import { useInitializeUserFeed } from '@/hooks/useInitializeUserFeed';
// import { useHabboFurniApi } from '@/hooks/useHabboFurniApi';
// import { useUnifiedClothingAPI } from '@/hooks/useUnifiedClothingAPI';
// import { useHomeAssets } from '@/hooks/useHomeAssets';

export const Home: React.FC = () => {
  const { t } = useI18n();
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0);
  const [showMockupAnimation, setShowMockupAnimation] = useState(false);
  const [showWindLines, setShowWindLines] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  
  // Posição final do mockup (encontrada pelo usuário)
  const FINAL_MOCKUP_POSITION = {
    leftPercent: 48,
    topOffset: 37 // calc(50% + 37px)
  };
  
  // Carregar posição salva do localStorage
  const loadSavedPosition = () => {
    try {
      const saved = localStorage.getItem('habbo-hub-mockup-position');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          topOffset: parsed.topOffset ?? FINAL_MOCKUP_POSITION.topOffset,
          leftPercent: parsed.leftPercent ?? FINAL_MOCKUP_POSITION.leftPercent
        };
      }
    } catch (e) {
      console.error('Erro ao carregar posição salva:', e);
    }
    return { 
      topOffset: FINAL_MOCKUP_POSITION.topOffset, 
      leftPercent: FINAL_MOCKUP_POSITION.leftPercent 
    };
  };
  
  const [mockupPosition, setMockupPosition] = useState(loadSavedPosition());
  
  // Animação: mostrar mockup após 2 segundos, linhas de vento com pequeno delay
  useEffect(() => {
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;
    const timer1 = setTimeout(() => {
      setShowMockupAnimation(true);
      // Mostrar linhas de vento com delay (0.45s após o sticker)
      timer3 = setTimeout(() => {
        setShowWindLines(true);
      }, 450);
      // Esconder linhas de vento após a animação do sticker terminar (0.8s + 0.45s)
      timer2 = setTimeout(() => {
        setShowWindLines(false);
      }, 1250);
    }, 2000);
    
    return () => {
      clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
    };
  }, []);
  
  // Salvar posição no localStorage
  useEffect(() => {
    localStorage.setItem('habbo-hub-mockup-position', JSON.stringify(mockupPosition));
  }, [mockupPosition]);
  
  // Lista de mockups - você pode adicionar mais URLs aqui
  const mockups = [
    'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/mockups/AU_RTS2011_Sticker_v1.gif',
    // Adicione mais mockups aqui quando tiver
  ];
  
  // Calcular estilos de posicionamento
  const mockupStyle = {
    left: `${mockupPosition.leftPercent}%`,
    top: `calc(50% + ${mockupPosition.topOffset}px)`,
    pointerEvents: 'none' as const
  };
  
  // Carrossel automático de mockups
  useEffect(() => {
    if (mockups.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentMockupIndex((prev) => (prev + 1) % mockups.length);
    }, 3000); // Muda a cada 3 segundos
    
    return () => clearInterval(interval);
  }, [mockups.length]);
  
  return (
    <SidebarProvider>
      <style>{`
        @keyframes windLineShrink {
          0% {
            width: calc(90% - 48%);
            left: 90%;
          }
          100% {
            width: 0px;
            left: 48%;
          }
        }
        @keyframes windLineFade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main 
            className="flex-1 p-8 min-h-screen"
            style={{ 
              backgroundImage: 'url(/assets/site/bghabbohub.png)',
              backgroundRepeat: 'repeat'
            }}
          >
            <div className="max-w-7xl mx-auto">
              {/* Banner padrão com fundo de nuvens */}
              <PageBanner 
                title="🏠 HabboHub"
                subtitle={t('pages.home.subtitle')}
                backgroundImage={getBannerImageBySeed('home')}
              />

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black overflow-hidden flex flex-col">
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
                  <CardContent className="p-6 pb-0">
                    <p className="text-gray-600 mb-0 volter-body-text">
                      <AccentFixedText>{t('pages.home.console.description')}</AccentFixedText>
                    </p>
                  </CardContent>
                  <div style={{ marginLeft: '-24px', marginRight: '-24px', width: 'calc(100% + 48px)', marginTop: '8px', overflow: 'hidden', height: '240px' }}>
                    <img 
                      src="/assets/imageconsole.gif" 
                      alt="Console preview"
                      className="w-full block"
                      style={{ 
                        height: '300px',
                        objectFit: 'cover', 
                        objectPosition: 'center',
                        display: 'block',
                        margin: 0,
                        padding: 0,
                        width: '100%',
                        transform: 'scale(0.9)',
                        marginTop: '-30px'
                      }}
                    />
                  </div>
                  <CardContent className="p-6 pt-4 mt-auto flex justify-center">
                    <Link to="/console">
                      <Button className="habbo-button-blue sidebar-font-option-4"
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          letterSpacing: '0.3px',
                          minWidth: '200px',
                          height: '44px'
                        }}>{t('pages.home.console.button')}</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black overflow-hidden flex flex-col">
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
                  <CardContent className="p-6 flex flex-col flex-1">
                    <p className="text-gray-600 mb-4 volter-body-text">
                      <AccentFixedText>{t('pages.home.homes.description')}</AccentFixedText>
                    </p>
                    
                    {/* Figurestring e Carrossel de Mockups */}
                    <div className="relative flex items-center justify-center mb-4" style={{ height: '200px', minHeight: '200px' }}>
                      {/* Figurestring centralizada */}
                      <div className="absolute z-0 flex items-center justify-center" style={{ 
                        left: '50%', 
                        top: '35%', 
                        transform: 'translate(-50%, -50%)' 
                      }}>
                        <img 
                          src="https://www.habbo.com.br/habbo-imaging/avatarimage?user=habbohub&action=std&direction=4&head_direction=4&gesture=sml&size=m" 
                          alt="Avatar de habbohub" 
                          className="w-16 h-28 object-contain" 
                          style={{ imageRendering: 'pixelated' }} 
                        />
                      </div>
                      
                      {/* Efeito de linhas de vento - 4 linhas horizontais seguindo o centro do sticker */}
                      {showWindLines && (
                        <div 
                          className="absolute"
                          style={{
                            left: '0',
                            top: '0',
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            overflow: 'visible',
                            zIndex: 9
                          }}
                        >
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute"
                              style={{
                                left: '90%',
                                top: `calc(50% + ${mockupPosition.topOffset - 20 + i * 12}px)`,
                                width: `calc(90% - ${mockupPosition.leftPercent}%)`,
                                height: '2px',
                                background: 'linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.4))',
                                boxShadow: '0 0 3px rgba(0, 0, 0, 0.6)',
                                transformOrigin: 'left center',
                                animation: showMockupAnimation ? `windLineShrink 0.8s ease-out forwards, windLineFade 0.3s ease-out 0.8s forwards` : 'none',
                                opacity: 1
                              }}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Carrossel de Mockups - Centralizado acima da figurestring */}
                      {mockups.length > 0 && (
                        <div 
                          className="absolute z-10 flex items-center justify-center" 
                          style={{
                            ...mockupStyle,
                            transform: showMockupAnimation ? 'translateX(-50%)' : 'translateX(calc(100vw + 100%))',
                            transition: showMockupAnimation ? 'transform 0.8s ease-out, opacity 0.8s ease-out' : 'none',
                            opacity: showMockupAnimation ? 1 : 0
                          }}
                        >
                          {mockups.map((mockupUrl, index) => (
                            <div
                              key={index}
                              className="absolute transition-opacity duration-500"
                              style={{
                                opacity: index === currentMockupIndex ? 1 : 0,
                                pointerEvents: 'none'
                              }}
                            >
                              <img 
                                src={mockupUrl} 
                                alt={`Mockup ${index + 1}`}
                                className="select-none pointer-events-none" 
                                draggable={false}
                                style={{ 
                                  imageRendering: 'pixelated',
                                  width: 'auto',
                                  height: 'auto',
                                  objectFit: 'contain',
                                  maxWidth: 'none',
                                  maxHeight: 'none'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto flex justify-center">
                      <Link to="/homes">
                        <Button className="habbo-button-green sidebar-font-option-4"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            letterSpacing: '0.3px',
                            minWidth: '200px',
                            height: '44px'
                          }}>{t('pages.home.homes.button')}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black flex flex-col">
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
                  <CardContent className="p-6 flex flex-col flex-1">
                    <p className="text-gray-600 mb-4 volter-body-text">
                      <AccentFixedText>{t('pages.home.tools.description')}</AccentFixedText>
                    </p>
                    <div className="mt-auto flex justify-center">
                      <Link to="/emblemas">
                        <Button className="habbo-button-yellow sidebar-font-option-4"
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            letterSpacing: '0.3px',
                            minWidth: '200px',
                            height: '44px'
                          }}>{t('pages.home.tools.button')}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Footer Disclaimer */}
            <Footer />
          </main>
        </SidebarInset>
      </div>
      
      {/* Troféu Flutuante - Agradecimentos */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCreditsDialog(true)}
          className="cursor-pointer hover:scale-110 transition-transform drop-shadow-lg bg-transparent border-none p-0"
          title="Agradecimentos"
        >
          <img 
            src="/assets/trophy.png"
            alt="Troféu de Ouro"
            className="w-32 h-32 object-contain"
            style={{ imageRendering: 'pixelated', backgroundColor: 'transparent' }}
          />
        </button>
      </div>

      {/* Dialog de Agradecimentos */}
      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center volter-font">
              {t('pages.home.credits.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="volter-body-text text-gray-700 space-y-3">
              <p>
                {t('pages.home.credits.intro')}
              </p>
              
              <p dangerouslySetInnerHTML={{
                __html: t('pages.home.credits.learned')
                  .replace(/Puhekupla/g, '<a href="https://puhekupla.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Puhekupla</a>')
                  .replace(/HabboEmotion/g, '<a href="https://habboemotion.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">HabboEmotion</a>')
                  .replace(/HabboAssets/g, '<a href="https://www.habboassets.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">HabboAssets</a>')
                  .replace(/Habborator/g, '<a href="https://habborator.org" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Habborator</a>')
                  .replace(/ViaJovem/g, '<a href="https://viajovem.blogspot.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">ViaJovem</a>')
                  .replace(/Habbo Templarios/g, '<a href="https://habbotemplarios.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Habbo Templarios</a>')
              }} />
              
              <p dangerouslySetInnerHTML={{
                __html: t('pages.home.credits.eonu')
                  .replace(/eonu/g, '<a href="https://github.com/eonu" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">eonu</a>')
                  .replace(/Volter/g, '<a href="https://github.com/eonu/goldfish" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Volter</a>')
              }} />
              
              <p>
                {t('pages.home.credits.conclusion')}
              </p>
              
              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <p className="text-center text-sm text-gray-700 volter-body-text">
                  {t('pages.home.credits.final')}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Home;