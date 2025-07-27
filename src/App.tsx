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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/eventos" element={<Index />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/emblemas" element={<Emblemas />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/mercado" element={<Mercado />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
