import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { NotificationProvider, useNotification } from '@/hooks/useNotification'
import { NotificationContainer } from '@/components/ui/notification'
import './index.css'
import './styles/widget-skins.css'

// Import pages
import Console from './pages/Console'
import ConsolePopup from './pages/ConsolePopup'
import HabboHomeV2 from './pages/HabboHomeV2'
import Home from './pages/Home'
import Homes from './pages/Homes'
import Login from './pages/Login'
import Journal from './pages/Journal'
import AdminPanel from './pages/AdminPanel'
import AdminDashboard from './pages/AdminDashboard'
import { AccountManager } from './pages/AccountManager'
import Tools from './pages/Tools'
import HanditemCatalog from './pages/HanditemCatalog'
import AvatarEditor from './pages/AvatarEditor'
import AltCodesPage from './pages/AltCodes' // CORRIGIDO: Import adicionado

import Profile from './pages/Profile'
import NotificationDemo from './pages/NotificationDemo'
import BeebopHome from './pages/BeebopHome'
import NotFound from './pages/NotFound'
import { FontTest } from './components/FontTest'
import { FontAlternativeTest } from './components/FontAlternativeTest'
// import { useDailyActivitiesInitializer } from './hooks/useDailyActivitiesInitializer' // Desativado temporariamente
import HomeRedirect from './components/HomeRedirect'

// QueryClient otimizado para performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 1, // Reduzir tentativas
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false, // Evitar refetch desnecessário
      networkMode: 'online', // Só executar quando online
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
})

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
    path: "/login-test",
    element: <Login />,
  },
  {
    path: "/connect-habbo",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Homes />,
  },
  {
    path: "/home/:username",
    element: <HabboHomeV2 />,
  },
  // Redirect from old /homes routes for backward compatibility
  {
    path: "/homes",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/homes/:username",
    element: <HomeRedirect />,
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
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/accounts",
    element: <AccountManager />,
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
    path: "/font-test",
    element: <FontTest />,
  },
  {
    path: "/font-alternatives",
    element: <FontAlternativeTest />,
  },
  {
    path: "/tools",
    element: <Tools />,
  },
  {
    path: "/profile/:username",
    element: <Profile />,
  },
  {
    path: "/profile/:username/:hotel",
    element: <Profile />,
  },
  {
    path: "/notification-demo",
    element: <NotificationDemo />,
  },
  {
    path: "/beebop-home",
    element: <BeebopHome />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

// Componente principal com notificações
const AppWithNotifications = () => {
  const { notifications, addNotification, removeNotification } = useNotification();

  return (
    <>
      <RouterProvider router={router} />
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
      <Toaster />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <AppWithNotifications />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)