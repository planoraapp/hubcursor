
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importe as páginas
import Index from './pages/Index';
import Console from './pages/Console';
import Homes from './pages/Homes';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Tools from './pages/Tools';
import Catalogo from './pages/Catalogo';
import Eventos from './pages/Eventos';
import EnhancedHabboHome from './pages/EnhancedHabboHome';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Página inicial */}
            <Route path="/" element={<Index />} />
            
            {/* Páginas principais */}
            <Route path="/console" element={<Console />} />
            <Route path="/homes" element={<Homes />} />
            <Route path="/enhanced-home/:username" element={<EnhancedHabboHome />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/eventos" element={<Eventos />} />
            
            {/* Páginas de perfil */}
            <Route path="/profile/:username" element={<Profile />} />
            
            {/* Redirecionamentos */}
            <Route path="/ferramentas" element={<Navigate to="/tools" replace />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
