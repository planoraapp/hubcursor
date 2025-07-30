
import { useState, useEffect, useRef, useCallback } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface Badge {
  code: string;
  name: string;
  description?: string;
  designer?: string;
  group?: string;
  releasedDate?: string;
  category?: string;
  image?: string;
  url?: string;
}

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

// Componente para o Modal de Detalhes do Emblema
function BadgeDetailModal({ isOpen, onClose, badge }: {
  isOpen: boolean;
  onClose: () => void;
  badge: Badge | null;
}) {
  if (!isOpen || !badge) return null;

  const imageUrl = badge.image || badge.url || `https://images.habbo.com/c_images/album1584/${badge.code}.png`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código do emblema copiado!');
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1001]" onClick={onClose}>
      <div className="bg-white border border-gray-900 rounded-lg shadow-xl p-6 relative max-w-lg w-11/12" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-700 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
            <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
          </svg>
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <img src={imageUrl} alt={badge.name} className="w-32 h-32 object-contain bg-gray-200 p-2 rounded-lg border border-gray-400" />
          <h3 className="text-2xl font-bold text-gray-800 volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>{badge.name}</h3>
          <p className="text-gray-700 text-sm italic">"{badge.description || 'Sem descrição disponível'}"</p>

          <div className="space-y-2 w-full text-left">
            <p className="text-gray-600">
              <span className="font-semibold">Código:</span>
              <code className="bg-gray-100 p-1 rounded cursor-pointer ml-2" onClick={() => copyToClipboard(badge.code)} title="Clique para copiar">
                {badge.code}
              </code>
            </p>
            {badge.designer && (
              <p className="text-gray-600">
                <span className="font-semibold">Designer:</span> {badge.designer}
              </p>
            )}
            {badge.group && (
              <p className="text-gray-600">
                <span className="font-semibold">Grupo:</span> {badge.group}
              </p>
            )}
            {badge.releasedDate && (
              <p className="text-gray-600">
                <span className="font-semibold">Lançamento:</span> {new Date(badge.releasedDate).toLocaleDateString('pt-BR')}
              </p>
            )}
            {badge.category && (
              <p className="text-gray-600">
                <span className="font-semibold">Categoria:</span> {badge.category}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function BadgesPage() {
  const [activeSection, setActiveSection] = useState('emblemas');
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

  // Carregar o script de emblemas quando o componente monta
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/js/emblemas.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const renderContent = () => (
    <div className="space-y-6">
      {/* Barra de Pesquisa */}
      <HabboPanel title="Buscar Emblemas">
        <input
          type="text"
          placeholder="Pesquisar por nome, código ou descrição..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </HabboPanel>

      {/* Grade de Emblemas */}
      <HabboPanel title="Galeria de Emblemas">
        <p className="text-red-600 text-center" style={{ display: 'none' }}>Não foi possível carregar os emblemas. Tente novamente mais tarde.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {/* Os emblemas serão inseridos aqui pelo JavaScript */}
        </div>
      </HabboPanel>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Emblemas Habbo"
            icon="/assets/emblemas.png"
            backgroundImage="/assets/1360__-3C7.png"
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
            title="Emblemas Habbo"
            icon="/assets/emblemas.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
