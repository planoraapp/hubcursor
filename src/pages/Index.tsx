
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Habbo Hub</h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo ao Habbo Hub - Sua comunidade Habbo
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/console')}>
            Acessar Console
          </Button>
          <Button variant="outline" onClick={() => navigate('/journal')}>
            Ver Journal Hub
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
