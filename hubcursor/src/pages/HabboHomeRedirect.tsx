
import { useParams, Navigate } from 'react-router-dom';

const HabboHomeRedirect = () => {
  const { username } = useParams<{ username: string }>();
  
  if (!username) {
    return <Navigate to="/" replace />;
  }
  
  // Default to .com.br hotel for backward compatibility
  return <Navigate to={`/home/com.br/${username}`} replace />;
};

export default HabboHomeRedirect;
