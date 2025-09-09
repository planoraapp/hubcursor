import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, UserPlus, Users, Shield, Globe } from 'lucide-react';
import { checkSupabaseAccounts, checkSpecificAccount, createHabbohubAccountIfNeeded } from '@/utils/checkSupabaseAccounts';

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
  const [habbohubStatus, setHabbohubStatus] = useState<string>('Verificando...');

  useEffect(() => {
    loadAccounts();
    checkHabbohubAccount();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await checkSupabaseAccounts();
      
      if (result.success) {
        setAccounts(result.accounts);
      } else {
        setError(result.error || 'Erro ao carregar contas');
      }
    } catch (err) {
      setError('Erro interno');
      console.error('Erro ao carregar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkHabbohubAccount = async () => {
    try {
      const result = await checkSpecificAccount('habbohub', 'br');
      
      if (result.success) {
        if (result.found) {
          setHabbohubStatus('✅ Conta habbohub existe');
        } else {
          setHabbohubStatus('❌ Conta habbohub não encontrada');
        }
      } else {
        setHabbohubStatus(`❌ Erro: ${result.error}`);
      }
    } catch (err) {
      setHabbohubStatus('❌ Erro ao verificar');
    }
  };

  const createHabbohub = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createHabbohubAccountIfNeeded();
      
      if (result.success) {
        if (result.created) {
          setHabbohubStatus('✅ Conta habbohub criada com sucesso!');
          await loadAccounts(); // Recarregar lista
        } else {
          setHabbohubStatus('ℹ️ Conta habbohub já existia');
        }
      } else {
        setError(result.error || 'Erro ao criar conta habbohub');
        setHabbohubStatus(`❌ Erro: ${result.error}`);
      }
    } catch (err) {
      setError('Erro interno');
      setHabbohubStatus('❌ Erro interno');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getHotelFlag = (hotel: string) => {
    const flags: { [key: string]: string } = {
      'br': '🇧🇷',
      'com': '🇺🇸',
      'com.tr': '🇹🇷',
      'es': '🇪🇸',
      'fi': '🇫🇮',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'nl': '🇳🇱',
      'com.br': '🇧🇷'
    };
    return flags[hotel] || '🌐';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white volter-font">
          👥 Gerenciador de Contas
        </h1>
        <Button 
          onClick={loadAccounts} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status do habbohub */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Status da Conta habbohub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-lg">{habbohubStatus}</span>
            {habbohubStatus.includes('não encontrada') && (
              <Button 
                onClick={createHabbohub}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Conta habbohub
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{accounts.length}</div>
            <div className="text-sm text-gray-600">Total de Contas</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">
              {accounts.filter(acc => acc.is_admin).length}
            </div>
            <div className="text-sm text-gray-600">Administradores</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
          <CardContent className="p-4 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {accounts.filter(acc => acc.is_online).length}
            </div>
            <div className="text-sm text-gray-600">Online</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {new Set(accounts.map(acc => acc.hotel)).size}
            </div>
            <div className="text-sm text-gray-600">Hotéis</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de contas */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-black">
        <CardHeader>
          <CardTitle>Contas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              <p className="mt-2">Carregando contas...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma conta encontrada
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getHotelFlag(account.hotel)}</div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {account.habbo_name}
                        {account.is_admin && (
                          <Badge variant="destructive" className="text-xs">
                            Admin
                          </Badge>
                        )}
                        {account.is_online && (
                          <Badge variant="default" className="bg-green-600 text-xs">
                            Online
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Hotel: {account.hotel} | 
                        Criado: {formatDate(account.created_at)}
                        {account.last_seen_at && (
                          <span> | Última vez: {formatDate(account.last_seen_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
