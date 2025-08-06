
import { SimplifiedLoginForm } from '../components/SimplifiedLoginForm';
import { useSimplifiedAuth } from '../hooks/useSimplifiedAuth';
import { Navigate } from 'react-router-dom';

const ConnectHabbo = () => {
  const { isLoggedIn, loading } = useSimplifiedAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg volter-font">Carregando...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <SimplifiedLoginForm />;
};

export default ConnectHabbo;
