
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, User, UserCheck, UserX } from 'lucide-react';

interface AccountStatus {
  exists: boolean;
  habbo_name: string;
  hotel: string;
  is_admin: boolean;
  created_at: string;
}

export const AccountStatusChecker: React.FC = () => {
  const [habboName, setHabboName] = useState('');
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const checkAccountStatus = async () => {
    if (!habboName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome Habbo para verificar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSearched(false);

    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('habbo_name, hotel, is_admin, created_at')
        .ilike('habbo_name', habboName.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAccountStatus({
          exists: true,
          habbo_name: data.habbo_name,
          hotel: data.hotel,
          is_admin: data.is_admin,
          created_at: data.created_at
        });
      } else {
        setAccountStatus({
          exists: false,
          habbo_name: habboName.trim(),
          hotel: '',
          is_admin: false,
          created_at: ''
        });
      }

      setSearched(true);
    } catch (error: any) {
            toast({
        title: "Erro",
        description: "Erro ao verificar conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Verificar Conta
        </CardTitle>
        <CardDescription>
          Verifique se um nome Habbo já possui conta no Habbo Hub
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Nome Habbo"
            value={habboName}
            onChange={(e) => setHabboName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAccountStatus()}
          />
          <Button 
            onClick={checkAccountStatus}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </Button>
        </div>

        {searched && accountStatus && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {accountStatus.exists ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <UserCheck className="w-5 h-5" />
                  <span className="font-semibold">Conta encontrada!</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{accountStatus.habbo_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hotel:</span>
                    <Badge variant="outline">{accountStatus.hotel.toUpperCase()}</Badge>
                  </div>
                  
                  {accountStatus.is_admin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <Badge className="bg-yellow-500">Admin</Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criada em:</span>
                    <span className="text-xs">{formatDate(accountStatus.created_at)}</span>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  💡 Esta conta já existe. Use a aba "Login" para acessar.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-600">
                  <UserX className="w-5 h-5" />
                  <span className="font-semibold">Conta não encontrada</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  O nome "{accountStatus.habbo_name}" não possui conta no Habbo Hub.
                </div>

                <div className="mt-3 p-2 bg-orange-50 rounded text-xs text-orange-700">
                  💡 Use a aba "Primeiro Acesso" para criar uma conta.
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
