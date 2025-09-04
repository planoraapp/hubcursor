
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginBySenha } from './auth/LoginBySenha';
import { LoginByMissao } from './auth/LoginByMissao';

export const HabboLoginForm = () => {
  const { user, loading, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('senha');

  console.log('🔍 [HabboLoginForm] Estado atual:', { user, loading, isLoggedIn });

  if (isLoggedIn) {
    console.log('✅ [HabboLoginForm] Redirecionando usuário logado');
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-repeat flex items-center justify-center p-4" style={{ backgroundImage: 'url("/assets/bghabbohub.png")' }}>
        <div className="text-center space-y-4">
          <div className="text-lg font-bold text-white">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-repeat flex items-center justify-center p-4" style={{ backgroundImage: 'url("/assets/bghabbohub.png")' }}>
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-black">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="https://raw.githubusercontent.com/planoraapp/hubcursor/main/public/assets/hubbeta.gif" alt="Habbo Hub" className="h-16" />
          </div>
          <CardTitle className="text-2xl volter-font text-gray-800">
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
