
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './hooks/useAuth';
import { useEffect } from 'react';
import { createBeebopAccount } from './utils/createBeebopAccount';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Emblemas from "./pages/Emblemas";
import Noticias from "./pages/Noticias";
import EventosPage from "./pages/Eventos";
import Forum from "./pages/Forum";
import Ferramentas from "./pages/Ferramentas";
import Catalogo from "./pages/Catalogo";
import Mercado from "./pages/Mercado";
import Editor from "./pages/Editor";
import HabboHome from "./pages/HabboHome";
import HomesHub from "./pages/HomesHub";
import Console from "./pages/Console";
import NotFound from "./pages/NotFound";
import AdminHub from "./pages/AdminHub";

const queryClient = new QueryClient();

const App = () => {
  // Criar conta Beebop automaticamente na inicialização
  useEffect(() => {
    const initBeebop = async () => {
      try {
        await createBeebopAccount();
      } catch (error) {
        console.log('Erro ao inicializar conta Beebop:', error);
      }
    };

    initBeebop();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile/:habboName" element={<Profile />} />
              <Route path="/emblemas" element={<Emblemas />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/eventos" element={<EventosPage />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/ferramentas" element={<Ferramentas />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/marketplace" element={<Mercado />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/home/:habboName" element={<HabboHome />} />
              <Route path="/homes" element={<HomesHub />} />
              <Route path="/console/:habboName" element={<Console />} />
              <Route path="/admin" element={<AdminHub />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
