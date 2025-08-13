
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '../hooks/useAuth';
import { getUserByName, getAvatarUrl } from '../services/habboApi';

export const UserProfile = ({ habboName }: { habboName: string }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await getUserByName(habboName);
        setUserData(user);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar perfil do Habbo.');
      } finally {
        setLoading(false);
      }
    };

    if (habboName) {
      fetchUserData();
    }
  }, [habboName]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Carregando Perfil...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aguarde enquanto carregamos as informações do Habbo.</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Erro ao Carregar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Perfil Não Encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nenhum usuário Habbo encontrado com o nome: {habboName}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Perfil de {userData.name}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Última atualização: {userData.lastAccessTime ? new Date(userData.lastAccessTime).toLocaleDateString() : 'N/A'}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={getAvatarUrl(userData.figureString)} 
              alt={userData.name} 
            />
            <AvatarFallback>{userData.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{userData.name}</p>
            <p className="text-sm text-muted-foreground">{userData.motto}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Informações:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="text-xs font-medium text-gray-700">ID:</span>
              <Badge variant="secondary" className="ml-1">{userData.uniqueId}</Badge>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-700">Online:</span>
              <Badge variant="outline" className="ml-1">{userData.online ? 'Sim' : 'Não'}</Badge>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-700">Conta criada:</span>
              <span className="text-xs ml-1">{userData.memberSince ? new Date(userData.memberSince).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
