
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import './App.css';

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Editor = lazy(() => import('./pages/Editor'));
const EditorPuhekupla = lazy(() => import('./pages/EditorPuhekupla'));
const Profile = lazy(() => import('./pages/Profile'));
const ConnectHabbo = lazy(() => import('./pages/ConnectHabbo'));
const Noticias = lazy(() => import('./pages/Noticias'));
const Catalogo = lazy(() => import('./pages/Catalogo'));
const Ferramentas = lazy(() => import('./pages/Ferramentas'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const Emblemas = lazy(() => import('./pages/Emblemas'));
const Console = lazy(() => import('./pages/Console'));
const Mercado = lazy(() => import('./pages/Mercado'));
const AdminHub = lazy(() => import('./pages/AdminHub'));
const ToolsPageNew = lazy(() => import('./pages/ToolsPageNew'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Suspense fallback={
              <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Carregando...</div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="/editor-puhekupla" element={<EditorPuhekupla />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/connect-habbo" element={<ConnectHabbo />} />
                <Route path="/noticias" element={<Noticias />} />
                {/* Redirect /eventos to /noticias */}
                <Route path="/eventos" element={<Navigate to="/noticias" replace />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/ferramentas" element={<Ferramentas />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/emblemas" element={<Emblemas />} />
                <Route path="/mercado" element={<Mercado />} />
                <Route path="/admin-hub" element={<AdminHub />} />
                <Route path="/tools" element={<ToolsPageNew />} />
                <Route path="/console" element={<Console />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
