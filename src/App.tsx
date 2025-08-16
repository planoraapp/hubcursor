
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Index from './pages/Index';
import Console from './pages/Console';
import Home from './pages/Home';
import HabboHomePage from './pages/HabboHomePage';
import { Journal } from './pages/Journal';
import { AdminHub } from './pages/AdminHub';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/console" element={<Console />} />
              <Route path="/home" element={<Home />} />
              <Route path="/home/:username" element={<HabboHomePage />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/admin-hub" element={<AdminHub />} />
              <Route path="/admin-hub-public" element={<AdminHub />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
