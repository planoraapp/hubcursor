
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

interface Badge {
  code: string;
  name: string;
  description: string;
}

export default function BadgesPage() {
  const [activeSection, setActiveSection] = useState('emblemas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
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

  // Simulated badges data - replace with actual API call
  useEffect(() => {
    const loadBadges = () => {
      const mockBadges = [
        { code: 'ADM', name: 'Administrador', description: 'Emblema de administrador do hotel' },
        { code: 'MOD', name: 'Moderador', description: 'Emblema de moderador do hotel' },
        { code: 'VIP01', name: 'VIP Ouro', description: 'Membro VIP Ouro' },
        { code: 'VIP02', name: 'VIP Prata', description: 'Membro VIP Prata' },
        { code: 'HC1', name: 'Habbo Club', description: 'Membro do Habbo Club' },
        { code: 'ACH_BasicClub1', name: 'Club Básico', description: 'Conquista de Club Básico' },
        { code: 'ACH_Login1', name: 'Primeiro Login', description: 'Primeiro login no hotel' },
        { code: 'ACH_RoomEntry1', name: 'Explorador', description: 'Primeiro quarto visitado' },
        // Add more mock badges
      ];
      setBadges(mockBadges);
      setLoading(false);
    };

    loadBadges();
  }, []);

  const getBadgeImageUrl = (code: string) => {
    return `https://www.habbo.com.br/habbo-imaging/badge/b_${code}.gif`;
  };

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  const closeModal = () => {
    setSelectedBadge(null);
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white border border-gray-900 rounded-lg shadow-md p-4">
        <input
          type="text"
          placeholder="Buscar emblemas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Badges Grid */}
      <div className="bg-white border border-gray-900 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 volter-font">
          Emblemas do Habbo ({filteredBadges.length})
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando emblemas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.code}
                onClick={() => handleBadgeClick(badge)}
                className="bg-gray-200 shadow-sm rounded-lg p-3 cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center"
                title={badge.name}
              >
                <img
                  src={getBadgeImageUrl(badge.code)}
                  alt={badge.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/emblemas.png';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white border border-gray-900 rounded-lg shadow-xl p-6 max-w-md w-11/12" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 volter-font">{selectedBadge.name}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="text-center mb-4">
              <img
                src={getBadgeImageUrl(selectedBadge.code)}
                alt={selectedBadge.name}
                className="w-16 h-16 object-contain mx-auto mb-3"
                onError={(e) => {
                  e.currentTarget.src = '/assets/emblemas.png';
                }}
              />
              <p className="text-gray-600 mb-2">{selectedBadge.description}</p>
              <p className="text-sm text-gray-500">Código: {selectedBadge.code}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedBadge.code);
                alert('Código copiado!');
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors volter-font"
            >
              Copiar Código
            </button>
          </div>
        </div>
      )}
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
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-full border border-gray-900">
            {renderContent()}
          </div>
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
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full border border-gray-900">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
