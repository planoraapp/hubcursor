
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ConnectHabbo from "./pages/ConnectHabbo";
import Profile from "./pages/Profile";
import ProfileEnhanced from "./pages/ProfileEnhanced";
import Forum from "./pages/Forum";
import ForumPage from "./pages/ForumPage";
import Noticias from "./pages/Noticias";
import Eventos from "./pages/Eventos";
import Catalogo from "./pages/Catalogo";
import BadgesPage from "./pages/BadgesPage";
import ToolsPage from "./pages/ToolsPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import Editor from "./pages/Editor";
import Mercado from "./pages/Mercado";
import Ferramentas from "./pages/Ferramentas";
import AdminHub from "./pages/AdminHub";
import NotFound from "./pages/NotFound";

// Add CSS for volter-font
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/connect-habbo" element={<ConnectHabbo />} />
          <Route path="/profile/:username" element={<ProfileEnhanced />} />
          <Route path="/forum-old" element={<Forum />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/emblemas" element={<BadgesPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/ferramentas" element={<ToolsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/adminhub" element={<AdminPanelPage />} />
          <Route path="/admin-panel" element={<AdminPanelPage />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/mercado" element={<Mercado />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
