import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { NotificationProvider, useNotification } from '@/hooks/useNotification'
import { NotificationContainer } from '@/components/ui/notification'
import './index.css'
import './styles/widget-skins.css'

// ⚡ OTIMIZAÇÃO: Importar apenas páginas críticas diretamente
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// 🚀 LAZY LOADING: Páginas não-críticas carregam sob demanda
const Console = lazy(() => import('./pages/Console'))
const ConsolePopup = lazy(() => import('./pages/ConsolePopup'))
const HabboHomeV2 = lazy(() => import('./pages/HabboHomeV2'))
const Homes = lazy(() => import('./pages/Homes'))
const Journal = lazy(() => import('./pages/Journal'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AccountManager = lazy(() => import('./pages/AccountManager').then(m => ({ default: m.AccountManager })))
const Tools = lazy(() => import('./pages/Tools'))
const HanditemCatalog = lazy(() => import('./pages/HanditemCatalog'))
const AvatarEditor = lazy(() => import('./pages/AvatarEditor'))
const AltCodesPage = lazy(() => import('./pages/AltCodes'))
const Profile = lazy(() => import('./pages/Profile'))
const NotificationDemo = lazy(() => import('./pages/NotificationDemo'))
const BeebopHome = lazy(() => import('./pages/BeebopHome'))
const FontTest = lazy(() => import('./components/FontTest').then(m => ({ default: m.FontTest })))
const FontAlternativeTest = lazy(() => import('./components/FontAlternativeTest').then(m => ({ default: m.FontAlternativeTest })))
const HomeRedirect = lazy(() => import('./components/HomeRedirect'))

// Utilitários de limpeza (não afetam loading)
import './utils/cleanupOldMessages'
import './utils/forceCleanupOldMessages'

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
      <p className="mt-4 text-gray-600 volter-font">Carregando...</p>
    </div>
  </div>
)

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

// Helper to wrap lazy components with Suspense
const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/console",
    element: withSuspense(Console),
  },
  {
    path: "/console-popup",
    element: withSuspense(ConsolePopup),
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
    element: withSuspense(Homes),
  },
  {
    path: "/home/:username",
    element: withSuspense(HabboHomeV2),
  },
  // Redirect from old /homes routes for backward compatibility
  {
    path: "/homes",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/homes/:username",
    element: withSuspense(HomeRedirect),
  },
  {
    path: "/enhanced-home/:username",
    element: withSuspense(HabboHomeV2),
  },
  {
    path: "/noticias",
    element: withSuspense(Journal),
  },
  {
    path: "/journal",
    element: withSuspense(Journal),
  },
  {
    path: "/admin-panel",
    element: withSuspense(AdminPanel),
  },
  {
    path: "/admin",
    element: withSuspense(AdminDashboard),
  },
  {
    path: "/admin/accounts",
    element: withSuspense(AccountManager),
  },
  {
    path: "/ferramentas",
    element: withSuspense(Tools),
  },
  {
    path: "/ferramentas/handitems",
    element: withSuspense(HanditemCatalog),
  },
  {
    path: "/ferramentas/avatar-editor",
    element: withSuspense(AvatarEditor),
  },
  {
    path: "/ferramentas/alt-codes",
    element: withSuspense(AltCodesPage),
  },
  {
    path: "/font-test",
    element: withSuspense(FontTest),
  },
  {
    path: "/font-alternatives",
    element: withSuspense(FontAlternativeTest),
  },
  {
    path: "/tools",
    element: withSuspense(Tools),
  },
  {
    path: "/profile/:username",
    element: withSuspense(Profile),
  },
  {
    path: "/profile/:username/:hotel",
    element: withSuspense(Profile),
  },
  {
    path: "/notification-demo",
    element: withSuspense(NotificationDemo),
  },
  {
    path: "/beebop-home",
    element: withSuspense(BeebopHome),
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
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <AppWithNotifications />
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
)