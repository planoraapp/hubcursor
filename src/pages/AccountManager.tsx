import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, UserPlus, Users, Shield, Globe } from 'lucide-react';
import { checkSupabaseAccounts, checkSpecificAccount } from '@/utils/checkSupabaseAccounts';
import { createHabbohubAccountDirect } from '@/utils/createHabbohubAccountDirect';

interface AccountData {
  id: string;
  habbo_name: string;
  hotel: string;
  is_admin: boolean;
  created_at: string;
  last_seen_at?: string;
  is_online: boolean;
}

export const AccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carregar contas ao montar o componente
  useEffect(() => {
    loadAccounts();
  }, []);

  // Função para carregar todas as contas
  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await checkSupabaseAccounts();
      
      if (result.success) {
        setAccounts(result.accounts);
        setSuccessMessage(`${result.accounts.length} contas carregadas com sucesso!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Erro ao carregar contas');
      }
    } catch (err) {
      setError('Erro interno ao carregar contas');
      console.error('Erro ao carregar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar conta específica
  const checkAccount = async (username: string, hotel: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await checkSpecificAccount(username, hotel);
      
      if (result.success) {
        if (result.found) {
          setSuccessMessage(`Conta encontrada: ${username} (${hotel})`);
        } else {
          setError(`Conta não encontrada: ${username} (${hotel})`);
        }
      } else {
        setError(result.error || 'Erro ao verificar conta');
      }
    } catch (err) {
      setError('Erro interno ao verificar conta');
      console.error('Erro ao verificar conta:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar conta habbohub
  const createHabbohubAccount = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createHabbohubAccountDirect();
      
      if (result.success) {
        setSuccessMessage('Conta habbohub criada com sucesso!');
        await loadAccounts(); // Recarregar lista
      } else {
        setError(result.message || 'Erro ao criar conta habbohub');
      }
    } catch (err) {
      setError('Erro interno ao criar conta habbohub');
      console.error('Erro ao criar conta habbohub:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 volter-font">
            Gerenciador de Contas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie contas do sistema HabboHub
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={loadAccounts}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={createHabbohubAccount}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4" />
            Criar HabboHub
          </Button>
        </div>
      </div>

      {/* Mensagens de status */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Contas</p>
              <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Shield className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.filter(account => account.is_admin).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Globe className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hotéis</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(accounts.map(account => account.hotel)).size}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Carregando contas...
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {account.habbo_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {account.habbo_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Hotel: {account.hotel.toUpperCase()} • 
                        Criado em: {formatDate(account.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {account.is_admin && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    
                    <Badge 
                      variant={account.is_online ? "default" : "secondary"}
                      className={account.is_online ? "bg-green-600" : "bg-gray-400"}
                    >
                      {account.is_online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ferramentas de teste */}
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => checkAccount('habbohub', 'br')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Verificar HabboHub
            </Button>
            
            <Button
              onClick={() => checkAccount('beebop', 'br')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Verificar Beebop
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};