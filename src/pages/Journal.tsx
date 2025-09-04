import React, { useState } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Newspaper, Send, Users, Calendar, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  fansite: string;
  fansiteLogo: string;
  image: string;
  category: string;
  date: string;
  isMain: boolean;
}

interface ClassifiedAd {
  id: string;
  title: string;
  content: string;
  image: string;
  price?: string;
  contact: string;
}

const Journal = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAd, setSelectedAd] = useState<ClassifiedAd | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Mock data for the journal
  const newsArticles: NewsArticle[] = [
    {
      id: '1',
      title: '25 Anos de Habbo Hotel: Uma Celebração Épica Cheia de Nostalgia e Novidades!',
      content: 'O Habbo Hotel está em festa! Completando 25 anos de existência, o icônico mundo pixelado convida todos os Habbos para uma celebração inesquecível. Prepare-se para uma onda de nostalgia com o retorno de mobis clássicos através do Furni-Matic e Collecti-Matic, além de novas Coroas de Fidelidade para os veteranos que acompanham o Hotel há 15, 20 e até 25 anos! A equipe Staff está organizando festas na Piscina com brindes e uma nova sala pública que promete agitar o Hotel dia e noite. Não perca a chance de compartilhar suas memórias com a hashtag #Habbo25 nas redes sociais e concorrer a prêmios ultra raros. O Diretor de Produto, Muumiopappa, deixou uma carta emocionante para a comunidade. Este aniversário é uma homenagem a todos os Habbos que construíram essa história!',
      author: 'Beebop',
      authorAvatar: 'https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-10.ch-3538-67.lg-275-82.sh-295-92.fa-1206-90%2Cs-0.g-1.d-2.h-2.a-0%2C41cb5bfd4dcecf4bf5de00b7ea872714.png',
      fansite: 'HabboHub',
      fansiteLogo: '/assets/bghabbohub.png',
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjDhGLvOEcU_FGqcBTve1JyAoNt4ddcqAqfBMrvY4SF2YhRPDTBZOjReNooP8907PJAViP3-0XmR-_hdbwhRvBt-8h6UCYEnERTxbJgQaqWhGECue1XiP2EsQXuO-s0GN6_8XthY9OmNNM/s1600/ts_fire.gif',
      category: 'Destaque',
      date: '2024-01-15',
      isMain: true
    },
    {
      id: '2',
      title: 'Análise: Campanha "Verão Neon" - Sucesso ou Fracasso?',
      content: 'Nossa equipe analisou a recente campanha "Verão Neon", que trouxe novos visuais e mobis vibrantes ao Hotel. Avaliamos o feedback da comunidade, a participação nos eventos e o impacto na economia. Foi um sucesso estrondoso ou deixou a desejar? Confira nossa análise completa e deixe sua opinião!',
      author: 'AnalistaPixel',
      authorAvatar: 'https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-1.ch-255-84.lg-275-1408.sh-295-64%2Cs-0.g-1.d-2.h-2.a-0%2C3565e22f0ecd66108595e64551d13483.png',
      fansite: 'Habblindados',
      fansiteLogo: '/assets/habblindados.png',
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ZQwexYD0dHL62sDM9haQACJeCZED1qCMXRVzABKDEhi9X5lUeQCaqerPziBsggI2JI1RRNqLffWln3xPZaoEijGkebyJQ7AdK0PYuaLdAT8pC_tUisNMgFJE99YP8fS54F5hg24s0g/s1600/BR_ts_elections_anarchist.gif',
      category: 'Análise',
      date: '2024-01-12',
      isMain: false
    }
  ];

  const classifiedAds: ClassifiedAd[] = [
    {
      id: '1',
      title: 'Vendo Quarto de Eventos',
      content: 'Vendo quarto grande e decorado, ideal para eventos de rádio ou festas. Capacidade para 50 Habbos, com Wireds de teleporte e palco. Preço negociável. Contato: [Nick do Vendedor].',
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFc-LIforDlqYWAxOgNN8-j8N5PaXYuTmuaIeKOOc18IRGfgsi0NkkWaJsjDfyaC_NePhneoS_w7ZvQMbIZy3KuGtSopEh9lwmT2-uTSDTcmpW-jBaPYbCVYFtFQLMd9rZxtlxYJL7dGMg/s1600/feature_cata_hort_jan18bun5.png',
      price: '50 HC',
      contact: 'Beebop'
    },
    {
      id: '2',
      title: 'Procuro Mobis LTD Antigos',
      content: 'Colecionador busca mobis LTD das campanhas de 2010 a 2015. Pago bem em moedas ou troco por raros atuais. Tenho interesse em Tronos, Sofás e Estátuas. Envie propostas para [Nick do Comprador].',
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKlk9eJDWBDDu1Rvq9b7CBnf15zxxPZ6Rjv311WLfp2gunR5LiYnrLfaf2gHBkbVExK1sWcq30GIIGCQkTTi9RChQ0y5vPx0FZDctPuvu4u4oR1OyaytDvouowrK18pmsHzQrXHnwegz5G/s1600/feature_cata_hort_jan18bun3.png',
      contact: 'HabboHotel'
    }
  ];

  const totalPages = 5;

  const scrollToSection = (sectionId: string) => {
    // Mapear seções para páginas
    const sectionToPage: { [key: string]: number } = {
      'destaques': 1,
      'eventos': 2,
      'entrevistas': 3,
      'opiniao': 4,
      'fansites': 5,
      'classificados': 1,
      'enviar-coluna': 1
    };
    
    const targetPage = sectionToPage[sectionId];
    if (targetPage) {
      setCurrentPage(targetPage);
    }
  };


  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionMessage('Sua coluna foi enviada com sucesso para análise! Agradecemos sua contribuição!');
    setShowSubmissionModal(true);
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main 
            className="flex-1 min-h-screen p-4 sm:p-8 bg-repeat" 
            style={{ 
              backgroundImage: 'url(/assets/bghabbohub.png)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          >
            <div className="max-w-7xl mx-auto relative" style={{ overflow: 'visible', padding: '20px' }}>
              {/* Newspaper Background Effect */}
              <div className="relative bg-gray-200 border-2 border-black p-6 sm:p-10 shadow-lg" style={{ 
                boxShadow: '4px 4px 0px 0px #1f2937',
                position: 'relative',
                zIndex: 1
              }}>
                {/* Second page - slightly offset to the right and down */}
                <div className="absolute bg-gray-300 border-2 border-gray-600" style={{ 
                  top: '6px',
                  left: '8px',
                  right: '-8px',
                  bottom: '-6px',
                  zIndex: 2
                }}></div>
                {/* Third page - more offset to the right and down */}
                <div className="absolute bg-gray-400 border-2 border-gray-700" style={{ 
                  top: '12px',
                  left: '16px',
                  right: '-16px',
                  bottom: '-12px',
                  zIndex: 1
                }}></div>
                
                {/* Header */}
                <header className="text-center mb-8 pb-4 border-b-2 border-black relative" style={{ zIndex: 5 }}>
                  <div className="flex items-center justify-center">
                    {/* Logo no canto esquerdo */}
                    <img 
                      src="/assets/bghabbohub.png" 
                      alt="Logo" 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 object-contain hidden sm:block"
                      style={{ imageRendering: 'pixelated' }}
                    />

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl text-black mb-2 font-bold" style={{ 
                      fontFamily: 'Press Start 2P, cursive',
                      textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                    }}>
                      JOURNAL HUB
                    </h1>

                    {/* Logo no canto direito */}
                    <img 
                      src="/assets/bghabbohub.png" 
                      alt="Logo" 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 object-contain hidden sm:block"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <p className="text-lg sm:text-xl text-gray-700" style={{ fontFamily: 'VT323, monospace' }}>
                    As últimas notícias direto do Hotel, pelos próprios Habbos!
                  </p>
                </header>

                {/* Navigation Menu */}
                <nav className="mb-8 flex flex-wrap justify-center gap-6 text-sm sm:text-base border-b border-gray-500 pb-4 relative" style={{ zIndex: 5 }}>
                  <button 
                    onClick={() => scrollToSection('destaques')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Destaques do Hotel
                  </button>
                  <button 
                    onClick={() => scrollToSection('eventos')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Eventos
                  </button>
                  <button 
                    onClick={() => scrollToSection('entrevistas')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Entrevistas
                  </button>
                  <button 
                    onClick={() => scrollToSection('opiniao')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Opinião
                  </button>
                  <button 
                    onClick={() => scrollToSection('fansites')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Fã Sites
                  </button>
                  <button 
                    onClick={() => scrollToSection('classificados')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Classificados Habbo
                  </button>
                  <button 
                    onClick={() => scrollToSection('enviar-coluna')}
                    className="text-black hover:text-blue-700 hover:underline transition-all duration-75"
                  >
                    Envie Sua Coluna
                  </button>
                </nav>


                {/* Journal Content */}
                <div 
                  className="relative"
                  style={{ zIndex: 5 }}
                >
                  {/* Page 1 - Cover */}
                  {currentPage === 1 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Main Content (2/3 width) */}
                      <div className="md:col-span-2 space-y-6">
                        {/* Main Article */}
                        <section id="destaques" className="mb-8">
                          <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                            fontFamily: 'Press Start 2P, cursive',
                            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                          }}>
                            Notícia em Destaque: {newsArticles[0].title}
                          </h2>
                          <div className="relative w-full h-48 sm:h-72 bg-gray-300 mb-4">
                            <img 
                              src={newsArticles[0].image} 
                              alt={newsArticles[0].title}
                              className="w-full h-full object-cover"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            {/* Author Avatar Overlay */}
                            <div className="absolute bottom-0 left-0" style={{ 
                              height: '110px',
                              width: '96px',
                              overflow: 'hidden',
                              pointerEvents: 'none'
                            }}>
                              <img 
                                src={newsArticles[0].authorAvatar}
                                alt={newsArticles[0].author}
                                className="absolute bottom-0 left-0"
                                style={{ 
                                  height: '165px',
                                  width: '96px',
                                  bottom: '-55px',
                                  objectFit: 'none',
                                  filter: 'drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.5))',
                                  imageRendering: 'pixelated'
                                }}
                              />
                            </div>
                            {/* Fansite Logo Overlay */}
                            <div className="absolute bottom-0 right-0" style={{ 
                              width: '180px',
                              height: '180px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              pointerEvents: 'none'
                            }}>
                              <img 
                                src={newsArticles[0].fansiteLogo}
                                alt={newsArticles[0].fansite}
                                className="max-w-full max-h-full object-contain"
                                style={{ 
                                  filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.3))',
                                  imageRendering: 'pixelated'
                                }}
                              />
                            </div>
                          </div>
                          <p className="text-base sm:text-lg mb-4 leading-relaxed" style={{ fontFamily: 'VT323, monospace' }}>
                            {newsArticles[0].content}
                          </p>
                          <a href="#" className="text-blue-700 hover:underline text-sm sm:text-base">
                            Leia o artigo completo...
                          </a>
                          <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'VT323, monospace' }}>
                            Por: {newsArticles[0].author} - {new Date(newsArticles[0].date).toLocaleDateString('pt-BR')}
                          </p>
                        </section>

                        <div className="border-t border-dashed border-gray-500 my-8"></div>

                        {/* Analysis Section */}
                        <section id="analise-campanhas" className="mb-8">
                          <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                            fontFamily: 'Press Start 2P, cursive',
                            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                          }}>
                            Análise: {newsArticles[1].title}
                          </h2>
                          <div className="relative w-full h-48 sm:h-64 bg-gray-300 mb-4">
                            <img 
                              src={newsArticles[1].image} 
                              alt={newsArticles[1].title}
                              className="w-full h-full object-cover"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            {/* Author Avatar Overlay */}
                            <div className="absolute bottom-0 left-0" style={{ 
                              height: '110px',
                              width: '96px',
                              overflow: 'hidden',
                              pointerEvents: 'none'
                            }}>
                              <img 
                                src={newsArticles[1].authorAvatar}
                                alt={newsArticles[1].author}
                                className="absolute bottom-0 left-0"
                                style={{ 
                                  height: '165px',
                                  width: '96px',
                                  bottom: '-55px',
                                  objectFit: 'none',
                                  filter: 'drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.5))',
                                  imageRendering: 'pixelated'
                                }}
                              />
                            </div>
                            {/* Fansite Logo Overlay */}
                            <div className="absolute bottom-0 right-0" style={{ 
                              width: '180px',
                              height: '180px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              pointerEvents: 'none'
                            }}>
                              <img 
                                src={newsArticles[1].fansiteLogo}
                                alt={newsArticles[1].fansite}
                                className="max-w-full max-h-full object-contain"
                                style={{ 
                                  filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.3))',
                                  imageRendering: 'pixelated'
                                }}
                              />
                            </div>
                          </div>
                          <p className="text-base sm:text-lg mb-4 leading-relaxed" style={{ fontFamily: 'VT323, monospace' }}>
                            {newsArticles[1].content}
                          </p>
                          <a href="#" className="text-blue-700 hover:underline text-sm sm:text-base">
                            Leia a análise completa...
                          </a>
                          <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'VT323, monospace' }}>
                            Por: {newsArticles[1].author} - {new Date(newsArticles[1].date).toLocaleDateString('pt-BR')}
                          </p>
                        </section>
                      </div>

                      {/* Sidebar (1/3 width) */}
                      <aside className="md:col-span-1 space-y-4">
                        {/* Classifieds */}
                        <div id="classificados" className="border-2 border-black p-4">
                          <h3 className="text-xl sm:text-2xl mb-3 font-bold" style={{ 
                            fontFamily: 'Press Start 2P, cursive',
                            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                          }}>
                            Classificados
                          </h3>
                          <div className="space-y-3">
                            {classifiedAds.map((ad) => (
                              <Dialog key={ad.id}>
                                <DialogTrigger asChild>
                                  <div className="border border-gray-300 p-2 cursor-pointer hover:bg-gray-50" style={{ 
                                    borderBottom: '1px dashed #4b5563',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '0.5rem'
                                  }}>
                                    <img 
                                      src={ad.image} 
                                      alt={ad.title}
                                      className="w-full h-20 object-cover mb-2"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                    <h4 className="font-bold text-base" style={{ fontFamily: 'VT323, monospace' }}>
                                      {ad.title}
                                    </h4>
                                    <p className="text-sm text-gray-600" style={{ fontFamily: 'VT323, monospace' }}>
                                      {ad.price && `Preço: ${ad.price}`}
                                    </p>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>{ad.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <img 
                                      src={ad.image} 
                                      alt={ad.title}
                                      className="w-full h-32 object-cover"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                    <p className="text-sm" style={{ fontFamily: 'VT323, monospace' }}>{ad.content}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold" style={{ fontFamily: 'VT323, monospace' }}>
                                        Contato: {ad.contact}
                                      </span>
                                      {ad.price && (
                                        <span className="text-sm font-bold text-green-600" style={{ fontFamily: 'VT323, monospace' }}>
                                          {ad.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ))}
                          </div>
                        </div>

                        {/* Submit Column - Compact Version */}
                        <div id="enviar-coluna" className="border-2 border-black p-3">
                          <h3 className="text-lg mb-2 font-bold" style={{ 
                            fontFamily: 'Press Start 2P, cursive',
                            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                          }}>
                            Envie Sua Coluna
                          </h3>
                          <p className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'VT323, monospace' }}>
                            Quer ver sua coluna publicada?
                          </p>
                          <Button 
                            onClick={() => scrollToSection('submit-column')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-none border-2 border-black text-sm py-1"
                            style={{ 
                              boxShadow: '2px 2px 0px 0px #1f2937',
                              fontFamily: 'VT323, monospace'
                            }}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Enviar
                          </Button>
                        </div>
                      </aside>
                    </div>
                    </div>
                  )}

                  {/* Page 2 - Eventos */}
                  {currentPage === 2 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                      <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                        fontFamily: 'Press Start 2P, cursive',
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                      }}>
                        Eventos do Hotel
                      </h2>
                      <p className="text-lg" style={{ fontFamily: 'VT323, monospace' }}>
                        Página em construção - Eventos especiais do Habbo Hotel serão exibidos aqui.
                      </p>
                    </div>
                  )}

                  {/* Page 3 - Entrevistas */}
                  {currentPage === 3 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                      <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                        fontFamily: 'Press Start 2P, cursive',
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                      }}>
                        Entrevistas Exclusivas
                      </h2>
                      <p className="text-lg" style={{ fontFamily: 'VT323, monospace' }}>
                        Página em construção - Entrevistas com personalidades do Habbo Hotel serão exibidas aqui.
                      </p>
                    </div>
                  )}

                  {/* Page 4 - Opinião */}
                  {currentPage === 4 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                      <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                        fontFamily: 'Press Start 2P, cursive',
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                      }}>
                        Opinião da Comunidade
                      </h2>
                      <p className="text-lg" style={{ fontFamily: 'VT323, monospace' }}>
                        Página em construção - Opiniões e artigos da comunidade serão exibidos aqui.
                      </p>
                    </div>
                  )}

                  {/* Page 5 - Fã Sites */}
                  {currentPage === 5 && (
                    <div className="p-8" style={{ minHeight: '80vh' }}>
                      <h2 className="text-2xl sm:text-3xl mb-4 border-b border-gray-500 pb-2 font-bold" style={{ 
                        fontFamily: 'Press Start 2P, cursive',
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
                      }}>
                        Destaque dos Fã Sites
                      </h2>
                      <p className="text-lg" style={{ fontFamily: 'VT323, monospace' }}>
                        Página em construção - Destaques dos melhores fã sites da comunidade serão exibidos aqui.
                      </p>
                    </div>
                  )}
                </div>



                {/* Page Navigation - Footer */}
                <div className="mt-8 flex justify-center items-center border-t-2 border-black pt-4 relative" style={{ zIndex: 5 }}>
                  <div className="flex items-center gap-4">
                    {currentPage > 1 && (
                      <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-none border-2 border-black"
                        style={{ 
                          boxShadow: '2px 2px 0px 0px #1f2937',
                          fontFamily: 'VT323, monospace'
                        }}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Página Anterior
                      </Button>
                    )}
                    
                    <span className="text-sm font-bold px-4 py-2 bg-gray-100 border-2 border-black" style={{ 
                      fontFamily: 'VT323, monospace',
                      boxShadow: '2px 2px 0px 0px #1f2937'
                    }}>
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    {currentPage < totalPages && (
                      <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-none border-2 border-black"
                        style={{ 
                          boxShadow: '2px 2px 0px 0px #1f2937',
                          fontFamily: 'VT323, monospace'
                        }}
                      >
                        Próxima Página
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <footer className="text-center mt-6 pt-6 border-t-2 border-black text-gray-700 text-sm relative" style={{ fontFamily: 'VT323, monospace', zIndex: 5 }}>
                  <p>&copy; 2025 Journal Hub. Todos os direitos reservados. Feito com pixel art.</p>
                  <p className="mt-2">Contato: jornal@habbohub.com | Siga-nos nas redes sociais do Habbo!</p>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="text-black border-black hover:bg-black hover:text-white"
                      onClick={() => window.open('/admin-panel', '_blank')}
                      style={{ fontFamily: 'VT323, monospace' }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Painel de Administração
                    </Button>
                  </div>
                </footer>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Submission Modal */}
      <Dialog open={showSubmissionModal} onOpenChange={setShowSubmissionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Coluna Enviada!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ fontFamily: 'VT323, monospace' }}>
              {submissionMessage}
            </p>
            <Button 
              onClick={() => setShowSubmissionModal(false)}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Journal;