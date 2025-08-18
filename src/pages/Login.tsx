
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { HabboLoginForm } from '@/components/HabboLoginForm';

const Login = () => {
  const { isLoggedIn, loading } = useAuth();

  console.log('🔍 [Login] Estado atual:', { isLoggedIn, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-center space-y-4">
          <div className="text-lg font-bold text-white">Carregando autenticação...</div>
          <div className="text-sm text-white/70">Aguarde alguns segundos</div>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/console" replace />;
  }

  return <HabboLoginForm />;
};

export default Login;
