
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="text-center space-y-8 p-8">
        <div className="flex justify-center">
          <img
            src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/site_images/erro%20404.png"
            alt="Erro 404"
            className="max-w-md w-full h-auto"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              // Fallback to a simple 404 text if image fails to load
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'text-9xl font-bold text-white mb-4';
              fallback.textContent = '404';
              e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
            }}
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white volter-font">
            Página não encontrada
          </h1>
          <p className="text-xl text-white/80">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <Button 
          onClick={() => navigate('/')}
          size="lg"
          className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 volter-font"
        >
          <Home className="w-5 h-5 mr-2" />
          Voltar ao início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
