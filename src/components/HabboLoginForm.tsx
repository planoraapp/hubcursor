
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

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-lg font-bold text-white">Carregando...</div>
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
