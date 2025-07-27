
import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { HomePage } from '../components/HomePage';
import { ExploreRooms } from '../components/ExploreRooms';
import { Catalog } from '../components/Catalog';
import { BadgeGuide } from '../components/BadgeGuide';
import { Rankings } from '../components/Rankings';
import { ProfileChecker } from '../components/ProfileChecker';
import { Tools } from '../components/Tools';

const Index = () => {
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveSection(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'inicio':
        return <HomePage />;
      case 'quartos':
        return <ExploreRooms />;
      case 'catalogo':
        return <Catalog />;
      case 'guias':
        return <BadgeGuide />;
      case 'classificacao':
        return <Rankings />;
      case 'perfil':
        return <ProfileChecker />;
      case 'ferramentas':
        return <Tools />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ede6] bg-repeat" style={{
      backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMEg0MFY0MEgwVjBaIiBmaWxsPSIjRjBFREU2Ii8+CjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNFN0UwRDQiLz4KPHJlY3QgeD0iMjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNFN0UwRDQiLz4KPHJlY3QgeT0iMjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNFN0UwRDQiLz4KPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRTdFMEQ0Ii8+Cjwvc3ZnPgo=')"
    }}>
      <div className="flex">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Index;
