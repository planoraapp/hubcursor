
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import Index from './pages/Index';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProfileEnhanced from './pages/ProfileEnhanced';
import Emblemas from './pages/Emblemas';
import BadgesPage from './pages/BadgesPage';
import Catalogo from './pages/Catalogo';
import Mercado from './pages/Mercado';
import Eventos from './pages/Eventos';
import Noticias from './pages/Noticias';
import Ferramentas from './pages/Ferramentas';
import Console from './pages/Console';
import Editor from './pages/Editor';
import EditorPuhekupla from './pages/EditorPuhekupla';
import EmblemaPuhekupla from './pages/EmblemaPuhekupla';
import FurniPuhekupla from './pages/FurniPuhekupla';
import AdminHub from './pages/AdminHub';
import AdminHubPublic from './pages/AdminHubPublic';
import AdminPanelPage from './pages/AdminPanelPage';
import Forum from './pages/Forum';
import ForumPage from './pages/ForumPage';
import ToolsPage from './pages/ToolsPage';
import ToolsPageNew from './pages/ToolsPageNew';
import NotFound from './pages/NotFound';
import HabboHome from './pages/HabboHome';
import HomesHub from './pages/HomesHub';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile/:username" element={<ProfileEnhanced />} />
              <Route path="/emblemas" element={<Emblemas />} />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/mercado" element={<Mercado />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/ferramentas" element={<Ferramentas />} />
              <Route path="/console" element={<Console />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor-puhekupla" element={<EditorPuhekupla />} />
              <Route path="/emblema-puhekupla" element={<EmblemaPuhekupla />} />
              <Route path="/furni-puhekupla" element={<FurniPuhekupla />} />
              <Route path="/admin-hub" element={<AdminHub />} />
              <Route path="/admin-hub-public" element={<AdminHubPublic />} />
              <Route path="/admin-panel" element={<AdminPanelPage />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum-page" element={<ForumPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools-new" element={<ToolsPageNew />} />
              <Route path="/homes" element={<HomesHub />} />
              <Route path="/home/:username" element={<HabboHome />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
