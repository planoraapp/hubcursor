
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { Console } from './pages/Console';
import { Console2 } from './pages/Console2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import EmblemaPuhekupla from './pages/EmblemaPuhekupla';
import Mercado from './pages/Mercado';

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
    path: "/console2", 
    element: <Console2 />,
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
    path: "/emblema-puhekupla",
    element: <EmblemaPuhekupla />,
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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
