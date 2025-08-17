
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import { HotelProvider } from './contexts/HotelContext';
import { MarketplaceProvider } from './contexts/MarketplaceProvider';
import App from './App';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HotelProvider>
          <MarketplaceProvider>
            <App />
          </MarketplaceProvider>
        </HotelProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
