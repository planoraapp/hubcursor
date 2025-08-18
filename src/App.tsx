import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient } from 'react-query';

// Importe as páginas
import Index from './pages/Index';
import Console from './pages/Console';
import Homes from './pages/Homes';
import Profile from './pages/Profile';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import Forum from './pages/Forum';
import Tools from './pages/Tools';
import Catalogo from './pages/Catalogo';
import Eventos from './pages/Eventos';
import EnhancedHabboHome from './pages/EnhancedHabboHome';

function App() {
  return (
    <QueryClient>
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
            <Route path="/home/:hotel/:username" element={<Home />} />
            <Route path="/profile/:username" element={<Profile />} />
            
            {/* Páginas de autenticação */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Redirecionamentos */}
            <Route path="/ferramentas" element={<Navigate to="/tools" replace />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
