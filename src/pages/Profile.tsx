
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '../components/UserProfile';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  if (!username) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Nome de usuário não fornecido.</p>
            <Button onClick={() => navigate('/')} className="mt-4 w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Perfil de {username}</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar
        </Button>
      </div>
      
      <UserProfile habboName={username} />
    </div>
  );
};

export default Profile;
