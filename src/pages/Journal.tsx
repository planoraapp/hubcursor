
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

export const Journal = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 p-4 sm:p-8" style={{ 
      fontFamily: "'VT323', monospace",
      imageRendering: 'crisp-edges'
    }}>
      <style jsx>{`
        .pixel-border {
          border: 1px solid #1f2937;
          box-shadow: 1px 1px 0px 0px #1f2937;
        }
        .pixel-heading {
          font-family: 'Press Start 2P', cursive;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
        }
        .newspaper-background {
          background-color: #E0E0E0;
          border: 4px solid #1f2937;
          box-shadow: 6px 6px 0px 0px #1f2937;
          position: relative;
          z-index: 1;
        }
        .newspaper-background::before,
        .newspaper-background::after {
          content: '';
          position: absolute;
          background-color: #D3D3D3;
          border: 4px solid #1f2937;
          box-shadow: 6px 6px 0px 0px #1f2937;
          border-radius: 0.25rem;
        }
        .newspaper-background::before {
          top: 4px;
          left: -4px;
          right: 4px;
          bottom: -4px;
          z-index: -1;
        }
        .newspaper-background::after {
          top: 8px;
          left: -8px;
          right: 8px;
          bottom: -8px;
          z-index: -2;
        }
        .news-divider {
          border-top: 1px dashed #4b5563;
          margin: 0.75rem 0;
        }
        .creator-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 75px;
          width: 64px;
          overflow: hidden;
          pointer-events: none;
        }
        .creator-overlay img {
          position: absolute;
          bottom: -35px;
          left: 0;
          height: 110px;
          width: 64px;
          object-fit: none;
          filter: drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.5));
        }
        .creator-overlay-large {
          height: 110px;
          width: 96px;
        }
        .creator-overlay-large img {
          height: 165px;
          width: 96px;
          bottom: -55px;
        }
        .pixelated {
          image-rendering: pixelated;
        }
      `}</style>

      <div className="max-w-7xl mx-auto newspaper-background rounded-md p-6 sm:p-10 shadow-lg">
        {/* Header */}
        <header className="text-center mb-8 pb-4 border-b-4 border-gray-900 relative">
          <div className="flex items-center justify-center">
            <img 
              src="https://placehold.co/60x60/808080/FFFFFF?text=Logo" 
              alt="" 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 object-contain pixelated hidden sm:block"
            />
            <h1 className="pixel-heading text-3xl sm:text-5xl text-gray-900">Journal Hub</h1>
            <img 
              src="https://placehold.co/60x60/808080/FFFFFF?text=Logo" 
              alt="" 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 object-contain pixelated hidden sm:block"
            />
          </div>
          <p className="text-lg sm:text-xl text-gray-700 mt-2">
            As últimas notícias direto do Hotel, pelos próprios Habbos!
          </p>
        </header>

        {/* Navigation */}
        <nav className="mb-8 flex flex-wrap justify-center gap-6 text-sm sm:text-base border-b-2 border-gray-500 pb-4">
          <button 
            onClick={() => scrollToSection('destaques')} 
            className="text-gray-900 hover:text-blue-700 hover:underline transition-all duration-75"
          >
            Destaques do Hotel
          </button>
          <button 
            onClick={() => scrollToSection('eventos')} 
            className="text-gray-900 hover:text-blue-700 hover:underline transition-all duration-75"
          >
            Eventos
          </button>
          <button 
            onClick={() => scrollToSection('entrevistas')} 
            className="text-gray-900 hover:text-blue-700 hover:underline transition-all duration-75"
          >
            Entrevistas
          </button>
          <button 
            onClick={() => scrollToSection('opiniao')} 
            className="text-gray-900 hover:text-blue-700 hover:underline transition-all duration-75"
          >
            Opinião
          </button>
          <button 
            onClick={() => scrollToSection('fansites')} 
            className="text-gray-900 hover:text-blue-700 hover:underline transition-all duration-75"
          >
            Fã Sites
          </button>
          <button 
            onClick={() => scrollToSection('classificados')} 
            className="text-gray-900 hover:text-blue-700 hover:underline transition-all duration-75"
          >
            Classificados
          </button>
          <button 
            onClick={() => scrollToSection('enviar-coluna')} 
            className="text-gray-900 hover:text-blue-700 hover:underline transition-all duration-75"
          >
            Envie Sua Coluna
          </button>
        </nav>

        <main>
          {/* Página 1: Destaques do Hotel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Coluna Principal */}
            <div className="md:col-span-2">
              <section id="destaques" className="p-4 mb-8">
                <h2 className="pixel-heading text-2xl sm:text-3xl mb-4 border-b-2 border-gray-500 pb-2">
                  Notícia em Destaque: 25 Anos de Habbo Hotel
                </h2>
                <div className="relative w-full h-48 sm:h-72 bg-gray-300 mb-4">
                  <img 
                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjDhGLvOEcU_FGqcBTve1JyAoNt4ddcqAqfBMrvY4SF2YhRPDTBZOjReNooP8907PJAViP3-0XmR-_hdbwhRvBt-8h6UCYEnERTxbJgQaqWhGECue1XiP2EsQXuO-s0GN6_8XthY9OmNNM/s1600/ts_fire.gif" 
                    alt="25 Anos Habbo" 
                    className="w-full h-full object-cover pixelated"
                  />
                  <div className="creator-overlay creator-overlay-large">
                    <img 
                      src="https://www.habbo.com.br/habbo-imaging/avatar/hr-155-45.hd-208-10.ch-3538-67.lg-275-82.sh-295-92.fa-1206-90%2Cs-0.g-1.d-2.h-2.a-0%2C41cb5bfd4dcecf4bf5de00b7ea872714.png" 
                      alt="Avatar Beebop" 
                      className="pixelated"
                    />
                  </div>
                </div>
                <p className="text-base sm:text-lg mb-4 leading-relaxed">
                  O Habbo Hotel está em festa! Completando 25 anos de existência, o icônico mundo pixelado convida todos os Habbos para uma celebração inesquecível. Prepare-se para uma onda de nostalgia com o retorno de mobis clássicos através do Furni-Matic e Collecti-Matic, além de novas Coroas de Fidelidade para os veteranos que acompanham o Hotel há 15, 20 e até 25 anos!
                </p>
                <a href="#" className="text-blue-700 hover:underline text-sm sm:text-base">
                  Leia o artigo completo...
                </a>
                <p className="text-xs text-gray-500 mt-2">Por: Beebop - 14 de Agosto de 2025</p>
              </section>
            </div>

            {/* Coluna Lateral de Anúncios */}
            <aside className="md:col-span-1 p-4">
              <h2 className="pixel-heading text-xl sm:text-2xl mb-4 border-b-2 border-gray-500 pb-2">
                Anúncios
              </h2>
              <article className="mb-6 p-3">
                <h3 className="font-bold text-base sm:text-lg mb-2">Anúncio: A Loja de Mobis Raros!</h3>
                <div className="w-full h-24 bg-gray-300 mb-3">
                  <img 
                    src="https://placehold.co/200x80/C0C0C0/1f2937?text=Anúncio+1" 
                    alt="Anúncio 1" 
                    className="w-full h-full object-cover pixelated"
                  />
                </div>
                <p className="text-sm leading-snug mb-2">
                  Não perca as ofertas exclusivas de mobis raros e LTDs! Visite a Loja de Mobis Raros e complete sua coleção.
                </p>
                <a href="#" className="text-blue-700 hover:underline text-xs">Confira agora!</a>
              </article>
            </aside>
          </div>

          {/* Seção de Classificados */}
          <section id="classificados" className="p-4 mb-8">
            <h2 className="pixel-heading text-2xl sm:text-3xl mb-4 border-b-2 border-gray-500 pb-2">
              Classificados Habbo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <div className="border-b border-dashed border-gray-500 pb-2 cursor-pointer hover:bg-gray-200 p-2 rounded">
                  <div className="flex items-start gap-2">
                    <img 
                      src="https://placehold.co/40x40/C0C0C0/1f2937?text=🏠" 
                      alt="Quarto" 
                      className="w-10 h-10 border border-gray-500 pixelated"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">Quarto RPG Medieval</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        Quarto temático medieval com castelo e dragão. Perfeito para aventuras épicas!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Formulário Enviar Coluna */}
          <section id="enviar-coluna" className="p-4 mb-8">
            <h2 className="pixel-heading text-2xl sm:text-3xl mb-4 border-b-2 border-gray-500 pb-2">
              Envie Sua Coluna
            </h2>
            <div className="max-w-2xl">
              <p className="text-base mb-4">
                Tem uma história interessante do Hotel? Uma opinião sobre os últimos eventos? 
                Envie sua coluna e ela pode ser publicada na próxima edição do Journal Hub!
              </p>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Seu Nome Habbo:</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-700 bg-white pixel-border" 
                    placeholder="Digite seu nome no Habbo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Título da Coluna:</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-700 bg-white pixel-border" 
                    placeholder="Digite o título da sua coluna"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Seção:</label>
                  <select className="w-full p-2 border border-gray-700 bg-white pixel-border">
                    <option>Opinião</option>
                    <option>Eventos</option>
                    <option>História do Hotel</option>
                    <option>Dicas e Truques</option>
                    <option>Entrevistas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Conteúdo:</label>
                  <textarea 
                    rows={8} 
                    className="w-full p-2 border border-gray-700 bg-white pixel-border" 
                    placeholder="Escreva sua coluna aqui..."
                  ></textarea>
                </div>
                <Button className="pixel-border bg-gray-900 text-white hover:bg-gray-700">
                  Enviar Coluna
                </Button>
              </form>
            </div>
          </section>
        </main>

        {/* Botão para voltar ao topo */}
        <Button 
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 pixel-border bg-gray-900 text-white hover:bg-gray-700"
          size="sm"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-600 border-t-2 border-gray-500 pt-4 mt-8">
          <p>Journal Hub - Um projeto da comunidade Habbo-Hub.com</p>
          <p>© 2025 - Feito com ❤️ pelos Habbos, para os Habbos</p>
        </footer>
      </div>
    </div>
  );
};
