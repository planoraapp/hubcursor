
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

// Componente para um card de Painel
function HabboPanel({ title, children, headerComponent }: { 
  title: string; 
  children: React.ReactNode; 
  headerComponent?: React.ReactNode; 
}) {
  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        {headerComponent ? (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>{title}</h2>
            {headerComponent}
          </div>
        ) : (
          <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg mb-4">
            <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>{title}</h3>
          </div>
        )}
        <div className="p-6 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Eventos() {
  const [activeSection, setActiveSection] = useState('eventos');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const renderContent = () => (
    <div className="space-y-6">
      <HabboPanel title="🔥 Eventos Atuais">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
            <div className="h-32 relative overflow-hidden" style={{ backgroundImage: 'url("/assets/1360__-3C7.png")', backgroundSize: 'cover', backgroundPosition: 'center center' }}>
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">Ativo</span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">Evento Oficial</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-800 mb-2">Festival de Inverno 2024</h3>
              <p className="text-sm text-gray-600 mb-3">Participe do maior evento da temporada! Ganhe móveis exclusivos, roupas especiais e emblemas únicos.</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Termina: 31 de Janeiro</span>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors volter-font">Participar</button>
              </div>
            </div>
          </div>
          {/* Add more event cards as needed */}
        </div>
      </HabboPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HabboPanel title="📅 Próximos Eventos">
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-white rounded-lg border border-gray-900 shadow-sm">
              <img src="/assets/595__-3CQ.png" alt="Torneio de Jogos" className="w-16 h-16 rounded-lg mr-4 border border-gray-400"/>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-1">Torneio de Jogos</h4>
                <p className="text-sm text-gray-600 mb-2">Competição de BattleBall, SnowStorm e outros jogos clássicos do Habbo.</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-purple-600 font-bold">Inicia: 1 de Fevereiro</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Torneio</span>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors volter-font">Ver calendário completo</button>
        </HabboPanel>

        <HabboPanel title="⏳ Resultados Pendentes">
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-gray-900 shadow-sm">
              <div className="flex items-center mb-3">
                <img src="/assets/264__-HG.png" alt="Concurso de Look Natalino" className="w-12 h-12 rounded mr-3 border border-gray-400"/>
                <div>
                  <h4 className="font-bold text-gray-800">Concurso de Look Natalino</h4>
                  <p className="text-sm text-gray-600">Aguardando resultado da votação popular</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">👥 156 participantes</span>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-gray-500">Aguardando resultado</span>
                </div>
              </div>
            </div>
          </div>
        </HabboPanel>
      </div>

      <HabboPanel title="📋 Regras e Informações">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-800 mb-3">Como Participar</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>Clique em "Participar" no evento desejado
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>Leia atentamente as regras específicas
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>Complete as tarefas dentro do prazo
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">4.</span>Aguarde a divulgação dos resultados
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-3">Premiação</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <img src="/assets/Diamante.png" alt="Diamantes" className="w-6 h-6 mr-2"/>
                <span>Diamantes exclusivos para vencedores</span>
              </div>
              <div className="flex items-center">
                <img src="/assets/264__-HG.png" alt="Emblemas" className="w-6 h-6 mr-2"/>
                <span>Emblemas únicos de participação</span>
              </div>
              <div className="flex items-center">
                <img src="/assets/gcreate_icon_credit.png" alt="Créditos" className="w-6 h-6 mr-2"/>
                <span>Créditos e móveis raros</span>
              </div>
            </div>
          </div>
        </div>
      </HabboPanel>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Eventos Habbo"
            icon="/assets/eventos.png"
            backgroundImage="/assets/event_bg_owner.png"
          />
          {renderContent()}
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="Eventos Habbo"
            icon="/assets/eventos.png"
            backgroundImage="/assets/event_bg_owner.png"
          />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
