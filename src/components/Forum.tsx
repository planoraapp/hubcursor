
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Forum = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para a página completa do fórum
    navigate('/forum');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-gray-500">Redirecionando para o fórum...</p>
    </div>
  );
};
