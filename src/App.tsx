
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/AppSidebar';
import Index from '@/pages/Index';
import Console from '@/pages/Console';
import HabboHome from '@/pages/HabboHome';
import EnhancedHabboHome from '@/pages/EnhancedHabboHome';

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/console" element={<Console />} />
              <Route path="/home/:hotel/:username" element={<HabboHome />} />
              <Route path="/home/:username" element={<HabboHome />} />
              <Route path="/profile/:username" element={<EnhancedHabboHome />} />
              <Route path="/noticias" element={<div className="p-8"><h1 className="text-2xl font-bold">Notícias</h1><p>Em breve...</p></div>} />
              <Route path="/eventos" element={<div className="p-8"><h1 className="text-2xl font-bold">Eventos</h1><p>Em breve...</p></div>} />
              <Route path="/marketplace" element={<div className="p-8"><h1 className="text-2xl font-bold">Marketplace</h1><p>Em breve...</p></div>} />
              <Route path="/forum" element={<div className="p-8"><h1 className="text-2xl font-bold">Fórum</h1><p>Em breve...</p></div>} />
              <Route path="/emblemas" element={<div className="p-8"><h1 className="text-2xl font-bold">Emblemas</h1><p>Em breve...</p></div>} />
              <Route path="/ferramentas" element={<div className="p-8"><h1 className="text-2xl font-bold">Ferramentas</h1><p>Em breve...</p></div>} />
              <Route path="/catalogo" element={<div className="p-8"><h1 className="text-2xl font-bold">Catálogo</h1><p>Em breve...</p></div>} />
              <Route path="/configuracoes" element={<div className="p-8"><h1 className="text-2xl font-bold">Configurações</h1><p>Em breve...</p></div>} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;
