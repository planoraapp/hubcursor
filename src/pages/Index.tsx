
import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { News } from '../components/News';
import { Forum } from '../components/Forum';
import { CatalogEnhanced } from '../components/CatalogEnhanced';
import { BadgesEnhanced } from '../components/BadgesEnhanced';
import { AvatarEditor } from '../components/AvatarEditor';
import { Marketplace } from '../components/Marketplace';

const Index = () => {
  const [activeSection, setActiveSection] = useState('noticias');

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
      case 'noticias':
        return <News />;
      case 'forum':
        return <Forum />;
      case 'catalogo':
        return <CatalogEnhanced />;
      case 'emblemas':
        return <BadgesEnhanced />;
      case 'editor':
        return <AvatarEditor />;
      case 'mercado':
        return <Marketplace />;
      default:
        return <News />;
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
