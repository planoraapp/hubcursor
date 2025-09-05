
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const HabboHomeRedirect = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToCanonicalRoute = async () => {
      if (!username) {
        navigate('/', { replace: true });
        return;
      }

      try {
        console.log('🔄 Redirecionando rota antiga para nova estrutura:', username);
        
        // Buscar o hotel do usuário
        const { data: userData, error } = await supabase
          .rpc('get_habbo_account_public_by_name', { 
            habbo_name_param: username.trim().toLowerCase() 
          });

        if (error || !userData || (Array.isArray(userData) && userData.length === 0)) {
          console.warn('⚠️ Usuário não encontrado, tentando rota sem hotel específico');
          navigate(`/home/com/${username}`, { replace: true });
          return;
        }

        const user = Array.isArray(userData) ? userData[0] : userData;
        const hotel = user.hotel || 'com';
        
        console.log(`✅ Redirecionando para /home/${hotel}/${username}`);
        navigate(`/home/${hotel}/${username}`, { replace: true });
        
      } catch (error) {
        console.error('❌ Erro ao redirecionar:', error);
        navigate(`/home/com/${username}`, { replace: true });
      }
    };

    redirectToCanonicalRoute();
  }, [username, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-repeat" style={{ 
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg volter-font text-white" style={{
          textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
        }}>
          Redirecionando para a home correta...
        </div>
      </div>
    </div>
  );
};

export default HabboHomeRedirect;
