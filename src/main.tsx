
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { UnifiedAuthProvider } from '@/hooks/useUnifiedAuth'
import './index.css'

// Import pages
import Console from './pages/Console'
import ConsolePopup from './pages/ConsolePopup'
import HabboHomeV2 from './pages/HabboHomeV2'
import Home from './pages/Home'
import Homes from './pages/Homes'
import Login from './pages/Login'
import Noticias from './pages/Noticias'
import Journal from './pages/Journal'
import AdminPanel from './pages/AdminPanel'
import Emblemas from './pages/Emblemas'
import Catalogo from './pages/Catalogo'
import Tools from './pages/Tools'
import HanditemCatalog from './pages/HanditemCatalog'
import AvatarEditor from './pages/AvatarEditor'
import AltCodesPage from './pages/AltCodes'
import Eventos from './pages/Eventos'
import Mercado from './pages/Mercado'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { useDailyActivitiesInitializer } from './hooks/useDailyActivitiesInitializer'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/console",
    element: <Console />,
  },
  {
    path: "/console-popup",
    element: <ConsolePopup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/connect-habbo",
    element: <Login />,
  },
  {
    path: "/homes",
    element: <Homes />,
  },
  {
    path: "/homes/:username",
    element: <HabboHomeV2 />,
  },
  {
    path: "/enhanced-home/:username",
    element: <HabboHomeV2 />,
  },
  {
    path: "/noticias",
    element: <Journal />,
  },
  {
    path: "/journal",
    element: <Journal />,
  },
  {
    path: "/admin-panel",
    element: <AdminPanel />,
  },
  {
    path: "/emblemas",
    element: <Emblemas />,
  },
  {
    path: "/catalogo",
    element: <Catalogo />,
  },
  {
    path: "/ferramentas",
    element: <Tools />,
  },
  {
    path: "/ferramentas/handitems",
    element: <HanditemCatalog />,
  },
  {
    path: "/ferramentas/avatar-editor",
    element: <AvatarEditor />,
  },
  {
    path: "/ferramentas/alt-codes",
    element: <AltCodesPage />,
  },
  {
    path: "/tools",
    element: <Tools />,
  },
  {
    path: "/eventos",
    element: <Eventos />,
  },
  {
    path: "/mercado",
    element: <Mercado />,
  },
  {
    path: "/profile/:username",
    element: <Profile />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
])

const AppWithInitializers = () => {
  useDailyActivitiesInitializer();
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UnifiedAuthProvider>
        <AppWithInitializers />
      </UnifiedAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
