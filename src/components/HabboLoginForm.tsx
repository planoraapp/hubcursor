
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LoginBySenha } from './auth/LoginBySenha';
import { LoginByMissao } from './auth/LoginByMissao';

export const HabboLoginForm = () => {
  const { user, loading, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('senha');
  const [forceShowLogin, setForceShowLogin] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Debug logs
  console.log('🔍 [HabboLoginForm] Estado atual:', { user, loading, isLoggedIn, forceShowLogin });

  // Timeout para loading muito longo
  useEffect(() => {
    if (loading && !forceShowLogin) {
      const timer = setTimeout(() => {
        console.log('⏰ [HabboLoginForm] Timeout de loading atingido');
        setLoadingTimeout(true);
      }, 5000); // 5 segundos

      return () => clearTimeout(timer);
    }
  }, [loading, forceShowLogin]);

  if (isLoggedIn && !forceShowLogin) {
    console.log('✅ [HabboLoginForm] Redirecionando usuário logado');
    return <Navigate to="/" replace />;
  }

  // Mostrar fallback se loading demora muito ou se forçar
  if (loading && !forceShowLogin && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-center space-y-4">
          <div className="text-lg font-bold text-white">Carregando...</div>
        </div>
      </div>
    );
  }

  // Se timeout de loading, mostrar opção de continuar
  if (loading && !forceShowLogin && loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-center space-y-4">
          <div className="text-lg font-bold text-white">Carregando...</div>
          <div className="space-y-2">
            <p className="text-white/80">O carregamento está demorando mais que o esperado</p>
            <Button 
              onClick={() => setForceShowLogin(true)}
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Continuar para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-gray-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">HH</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Habbo Hub
          </CardTitle>
          <CardDescription>
            Conecte sua conta Habbo para acessar o hub
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="senha">Senha</TabsTrigger>
              <TabsTrigger value="missao">Missão</TabsTrigger>
            </TabsList>

            <TabsContent value="senha">
              <LoginBySenha />
            </TabsContent>

            <TabsContent value="missao">
              <LoginByMissao />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
