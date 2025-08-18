
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import './index.css'

// Import pages
import Console from './pages/Console'
import SimpleLogin from './pages/SimpleLogin'
import SimpleRegister from './pages/SimpleRegister'
import HabboHomeV2 from './pages/HabboHomeV2'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <SimpleLogin />,
  },
  {
    path: "/login",
    element: <SimpleLogin />,
  },
  {
    path: "/register", 
    element: <SimpleRegister />,
  },
  {
    path: "/console",
    element: <Console />,
  },
  {
    path: "/enhanced-home/:username",
    element: <HabboHomeV2 />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>,
)
