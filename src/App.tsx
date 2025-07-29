
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Noticias from "./pages/Noticias";
import Forum from "./pages/Forum";
import Catalogo from "./pages/Catalogo";
import Emblemas from "./pages/Emblemas";
import Editor from "./pages/Editor";
import Mercado from "./pages/Mercado";
import Ferramentas from "./pages/Ferramentas";
import ConnectHabbo from "./pages/ConnectHabbo";
import Profile from "./pages/Profile";
import Eventos from "./pages/Eventos";
import AdminHub from "./pages/AdminHub";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/emblemas" element={<Emblemas />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/mercado" element={<Mercado />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            <Route path="/connect-habbo" element={<ConnectHabbo />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/adminhub" element={<AdminHub />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
