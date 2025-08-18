import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Console from './pages/Console';
import SimpleLogin from './pages/SimpleLogin';
import SimpleRegister from './pages/SimpleRegister';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient } from '@tanstack/react-query';
import EnhancedHabboHome from './pages/EnhancedHabboHome';
import HabboHomeV2 from './pages/HabboHomeV2';

function App() {
  return (
    <Router>
      <QueryClient>
        <div className="App">
          <Routes>
            <Route path="/" element={<SimpleLogin />} />
            <Route path="/login" element={<SimpleLogin />} />
            <Route path="/register" element={<SimpleRegister />} />
            <Route path="/console" element={<Console />} />
            <Route path="/enhanced-home/:username" element={<EnhancedHabboHome />} />
            <Route path="/enhanced-home/:username" element={<HabboHomeV2 />} />
          </Routes>
          <Toaster />
        </div>
      </QueryClient>
    </Router>
  );
}

export default App;
