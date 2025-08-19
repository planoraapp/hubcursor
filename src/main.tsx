
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import './index.css'

// Import pages
import Console from './pages/Console'
import HabboHomeV2 from './pages/HabboHomeV2'
import Home from './pages/Home'
import Homes from './pages/Homes'
import Noticias from './pages/Noticias'
import Emblemas from './pages/Emblemas'
import Catalogo from './pages/Catalogo'
import Tools from './pages/Tools'
import Eventos from './pages/Eventos'
import Mercado from './pages/Mercado'

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
    element: <Noticias />,
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
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
