import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryProvider } from '@/components/QueryProvider';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import HabboConsole from '@/pages/HabboConsole';
import Noticias from '@/pages/Noticias';
import Eventos from '@/pages/Eventos';
import Catalogo from '@/pages/Catalogo';
import Mercado from '@/pages/Mercado';
import Emblemas from '@/pages/Emblemas';
import Tops from '@/pages/Tops';
import Forum from '@/pages/Forum';
import Configuracoes from '@/pages/Configuracoes';
import Comunidade from '@/pages/Comunidade';
import Profile from '@/pages/Profile';
import Editor from '@/pages/Editor';
import Marketplace from '@/pages/Marketplace';
import Blog from '@/pages/Blog';
import AdminHub from '@/pages/AdminHub';
import Games from '@/pages/Games';
import EnhancedHabboHome from '@/pages/EnhancedHabboHome';
import Homes from '@/pages/Homes';

function App() {
  return (
    <Router>
      <QueryProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home/:username" element={<EnhancedHabboHome />} />
          <Route path="/homes" element={<Homes />} />
          <Route path="/console" element={<HabboConsole />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/mercado" element={<Mercado />} />
          <Route path="/emblemas" element={<Emblemas />} />
          <Route path="/tops" element={<Tops />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<AdminHub />} />
          <Route path="/games" element={<Games />} />
        </Routes>
      </QueryProvider>
    </Router>
  );
}

export default App;
