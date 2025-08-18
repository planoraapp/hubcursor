
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import { UnifiedAuthProvider } from './hooks/useUnifiedAuth';
import { HotelProvider } from './contexts/HotelContext';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Profile from './pages/Profile';
import Console from './pages/Console';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Homes from './pages/Homes';
import Editor from './pages/Editor';
import HabboHomeRedirect from './pages/HabboHomeRedirect';
import AdminHubPublic from './pages/AdminHubPublic';
import BadgesPage from './pages/BadgesPage';
import ToolsPage from './pages/ToolsPage';
import Emblemas from './pages/Emblemas';
import Noticias from './pages/Noticias';
import Catalogo from './pages/Catalogo';
import Ferramentas from './pages/Ferramentas';
import EventosPage from './pages/Eventos';
import EditorPuhekupla from './pages/EditorPuhekupla';
import Mercado from './pages/Mercado';
import EnhancedHome from './pages/EnhancedHome';

import './index.css';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/profile/:username",
    element: <Profile />,
  },
  {
    path: "/console",
    element: <Console />,
  },
  {
    path: "/homes",
    element: <Homes />,
  },
  {
    path: "/home/:username",
    element: <HabboHomeRedirect />,
  },
  {
    path: "/enhanced-home/:username",
    element: <EnhancedHome />,
  },
  {
    path: "/editor",
    element: <Editor />,
  },
  {
    path: "/admin-hub-public",
    element: <AdminHubPublic />,
  },
  {
    path: "/badges",
    element: <BadgesPage />,
  },
  {
    path: "/tools",
    element: <ToolsPage />,
  },
  {
    path: "/emblemas",
    element: <Emblemas />,
  },
  {
    path: "/noticias",
    element: <Noticias />,
  },
  {
    path: "/catalogo",
    element: <Catalogo />,
  },
  {
    path: "/ferramentas",
    element: <Ferramentas />,
  },
  {
    path: "/eventos",
    element: <EventosPage />,
  },
  {
    path: "/editor-puhekupla",
    element: <EditorPuhekupla />,
  },
  {
    path: "/mercado",
    element: <Mercado />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UnifiedAuthProvider>
            <HotelProvider>
              <MarketplaceProvider>
                <RouterProvider router={router} />
                <Toaster />
              </MarketplaceProvider>
            </HotelProvider>
          </UnifiedAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
