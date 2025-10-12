import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { extractOriginalUsername, extractHotelFromUsername, generateUniqueUsername } from '@/utils/usernameUtils';

interface CanonicalUrlRedirectProps {
  children: React.ReactNode;
}

/**
 * Componente que garante URLs canônicas para homes
 * Redireciona automaticamente para a URL correta se necessário
 */
export const CanonicalUrlRedirect: React.FC<CanonicalUrlRedirectProps> = ({ children }) => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;

    // Extrair informações da URL atual
    const originalUsername = extractOriginalUsername(username);
    const extractedHotel = extractHotelFromUsername(username);
    
    // Gerar URL canônica
    const canonicalUsername = generateUniqueUsername(originalUsername, extractedHotel);
    
    // Se a URL atual não é canônica, redirecionar
    if (username !== canonicalUsername) {
      console.log(`🔄 Redirecionando para URL canônica: ${username} → ${canonicalUsername}`);
      navigate(`/home/${canonicalUsername}`, { replace: true });
    }
  }, [username, navigate]);

  return <>{children}</>;
};
