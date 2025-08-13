
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EnhancedHabboHome from '@/pages/EnhancedHabboHome';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from '@/hooks/use-toast';
import { useInitializeUserFeed } from '@/hooks/useInitializeUserFeed';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useEffect } from 'react';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Router>
          <SiteHeader />
          <Routes>
            <Route path="/habbo/:hotel/:username" element={<EnhancedHabboHome />} />
            <Route path="/habinfo/:hotel/:username" element={<EnhancedHabboHome />} />
          </Routes>
          <SiteFooter />
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
