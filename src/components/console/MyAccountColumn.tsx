
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export const MyAccountColumn = () => {
  const { user, habboAccount, isLoggedIn } = useAuth();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Minha Conta</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoggedIn && habboAccount ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={`https://www.habbo.com/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&direction=2&head_direction=3&size=m`}
                  alt={habboAccount.habbo_name}
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-bold">{habboAccount.habbo_name}</p>
                  <p className="text-sm text-gray-600">Online</p>
                </div>
              </div>
            </div>
          ) : (
            <p>Não logado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
