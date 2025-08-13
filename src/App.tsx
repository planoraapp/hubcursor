
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import { HotelProvider } from './contexts/HotelContext';
import { MarketplaceProvider } from './contexts/MarketplaceProvider';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import EnhancedHabboHome from './pages/EnhancedHabboHome';
import HabboHomeRedirect from './pages/HabboHomeRedirect';
import HomesHub from './pages/HomesHub';
import Mercado from './pages/Mercado';
import Emblemas from './pages/Emblemas';
import Editor from './pages/Editor';
import Catalogo from './pages/Catalogo';
import Eventos from './pages/Eventos';
import Ferramentas from './pages/Ferramentas';
import Console from './pages/Console';
import Noticias from './pages/Noticias';
import Forum from './pages/Forum';
import NotFound from './pages/NotFound';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HotelProvider>
          <MarketplaceProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home/:username" element={<HabboHomeRedirect />} />
                <Route path="/home/:hotel/:username" element={<EnhancedHabboHome />} />
                {/* Aliases para rotas canônicas por hotel/usuário */}
                <Route path="/habbo/:hotel/:username" element={<EnhancedHabboHome />} />
                <Route path="/habinfo/:hotel/:username" element={<EnhancedHabboHome />} />
                <Route path="/homes" element={<HomesHub />} />
                <Route path="/mercado" element={<Mercado />} />
                <Route path="/emblemas" element={<Emblemas />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/eventos" element={<Eventos />} />
                <Route path="/ferramentas" element={<Ferramentas />} />
                <Route path="/console" element={<Console />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </MarketplaceProvider>
        </HotelProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
