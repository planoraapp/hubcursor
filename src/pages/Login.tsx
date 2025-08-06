
import React from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Navigate } from 'react-router-dom';
import { HabboLoginForm } from '@/components/HabboLoginForm';

const Login = () => {
  const { isLoggedIn, loading } = useUnifiedAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-lg volter-font text-white">Carregando...</div>
      </div>
    );
  }

  // Se já estiver logado, redirecionar para a página principal
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <HabboLoginForm />;
};

export default Login;
