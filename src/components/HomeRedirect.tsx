import { useParams, Navigate } from 'react-router-dom';

const HomeRedirect = () => {
  const { username } = useParams<{ username: string }>();
  
  if (!username) {
    return <Navigate to="/home" replace />;
  }
  
  return <Navigate to={`/home/${username}`} replace />;
};

export default HomeRedirect;
