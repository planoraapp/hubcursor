import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Noticias from "./pages/Noticias";
import Forum from "./pages/Forum";
import Catalogo from "./pages/Catalogo";
import Emblemas from "./pages/Emblemas";
import Editor from "./pages/Editor";
import Mercado from "./pages/Mercado";
import Ferramentas from "./pages/Ferramentas";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/eventos" element={<Index />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/emblemas" element={<Emblemas />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/mercado" element={<Mercado />} />
              <Route path="/ferramentas" element={<Ferramentas />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
