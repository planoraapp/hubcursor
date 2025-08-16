
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HabboHomePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Perfil de {username}</h1>
        <p className="text-muted-foreground text-lg">
          Página do perfil do usuário Habbo
        </p>
        <Button onClick={() => navigate('/console')}>
          Voltar ao Console
        </Button>
      </div>
    </div>
  );
};

export default HabboHomePage;
