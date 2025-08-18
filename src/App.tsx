import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Console from '@/pages/Console';
import HabboHome from '@/pages/HabboHome';
import Forum from '@/pages/Forum';
import Mission from '@/pages/Mission';
import Profile from '@/pages/Profile';
import ProfileEnhanced from '@/pages/ProfileEnhanced';
import HabboHomeRedirect from '@/components/HabboHomeRedirect';
import EnhancedHabboHome from '@/pages/EnhancedHabboHome';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/console" element={<Console />} />
          <Route path="/homes" element={<HabboHome />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/enhanced-profile/:username" element={<ProfileEnhanced />} />
          <Route path="/enhanced-home/:username" element={<EnhancedHabboHome />} />
          
          {/* Redirect old routes */}
          <Route path="/home/:username" element={<HabboHomeRedirect />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
