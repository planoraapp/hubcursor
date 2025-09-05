
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ 
        backgroundImage: 'url("/assets/bghabbohub.png")',
        backgroundRepeat: 'repeat'
      }}>
        <div className="text-center space-y-4">
          <div className="text-lg font-bold text-white">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      backgroundImage: 'url("/assets/bghabbohub.png")',
      backgroundRepeat: 'repeat'
    }}>
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-black">
          <CardTitle className="text-center volter-font">Login Habbo</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="volter-font">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="border-2 border-gray-300 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="volter-font">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="border-2 border-gray-300 focus:border-blue-500"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold volter-font"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
