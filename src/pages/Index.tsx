
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { DebugAuthInfo } from '@/components/DebugAuthInfo';
import { ConnectHabboFormEnhanced } from '@/components/ConnectHabboFormEnhanced';

const Index = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Habbo Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Bem-vindo ao Habbo Hub!</p>
          </CardContent>
        </Card>

        <DebugAuthInfo />

        {!isLoggedIn && (
          <div className="flex justify-center">
            <ConnectHabboFormEnhanced />
          </div>
        )}

        {isLoggedIn && (
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Você está logado como: {user?.habbo_name}</p>
              <div className="mt-4">
                <Button asChild>
                  <a href="/console">Ir para Console</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
