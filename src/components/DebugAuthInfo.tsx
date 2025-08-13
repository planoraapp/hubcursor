
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';

export const DebugAuthInfo = () => {
  const { user, userProfile, loading, isLoggedIn, isAdmin } = useAuth();

  if (loading) {
    return (
      <Card className="mb-6 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">🔍 Debug - Estado de Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Carregando informações de autenticação...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-sm">🔍 Debug - Estado de Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-700">Status de Login:</p>
            <Badge className={isLoggedIn ? 'bg-green-500' : 'bg-red-500'}>
              {isLoggedIn ? 'Logado' : 'Não Logado'}
            </Badge>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-700">Supabase User ID:</p>
            <p className="text-xs text-gray-600 font-mono">
              {user?.id || 'Nenhum'}
            </p>
          </div>
        </div>

        {userProfile && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-gray-700">Conta Habbo Vinculada:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Nome:</span> {userProfile.habbo_name}
              </div>
              <div>
                <span className="font-medium">ID:</span> {userProfile.habbo_id}
              </div>
              <div>
                <span className="font-medium">Admin:</span> 
                <Badge className={isAdmin() ? 'bg-yellow-500 ml-1' : 'bg-gray-500 ml-1'}>
                  {isAdmin() ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {!userProfile && user && (
          <div className="border-t pt-3">
            <p className="text-xs text-orange-600">
              ⚠️ Usuário autenticado mas sem conta Habbo vinculada
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-2">
          Sistema: Auth System | Timestamp: {new Date().toLocaleString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
};
