
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Home</h1>
        <p className="text-muted-foreground text-lg">
          Página inicial do usuário
        </p>
        <Button onClick={() => navigate('/console')}>
          Ir para Console
        </Button>
      </div>
    </div>
  );
};

export default Home;
