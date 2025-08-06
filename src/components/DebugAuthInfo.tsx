
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export const DebugAuthInfo = () => {
  const { user, habboAccount, isLoggedIn } = useAuth();
  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar contas:', error);
      } else {
        setAllAccounts(data || []);
      }
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupDuplicates = async () => {
    try {
      // Buscar contas "beebop" duplicadas
      const { data: beebopAccounts } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', 'beebop')
        .order('created_at', { ascending: true });

      if (beebopAccounts && beebopAccounts.length > 1) {
        // Manter apenas a primeira conta (mais antiga)
        const accountsToDelete = beebopAccounts.slice(1);
        
        for (const account of accountsToDelete) {
          console.log('Deletando conta duplicada:', account);
          await supabase
            .from('habbo_accounts')
            .delete()
            .eq('id', account.id);
        }

        alert(`${accountsToDelete.length} contas duplicadas removidas`);
        loadAccounts();
      } else {
        alert('Nenhuma conta duplicada encontrada');
      }
    } catch (error) {
      console.error('Erro ao limpar duplicatas:', error);
      alert('Erro ao limpar duplicatas');
    }
  };

  if (loading) {
    return <div>Carregando debug info...</div>;
  }

  return (
    <Card className="p-6 mb-4">
      <h3 className="text-lg font-bold mb-4">🔍 Debug - Informações de Autenticação</h3>
      
      <div className="space-y-4">
        <div>
          <strong>Status Login:</strong> {isLoggedIn ? '✅ Logado' : '❌ Não logado'}
        </div>
        
        {user && (
          <div>
            <strong>Usuário Supabase:</strong>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
              {JSON.stringify({
                id: user.id,
                email: user.email,
                metadata: user.user_metadata
              }, null, 2)}
            </pre>
          </div>
        )}
        
        {habboAccount && (
          <div>
            <strong>Conta Habbo Vinculada:</strong>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
              {JSON.stringify(habboAccount, null, 2)}
            </pre>
          </div>
        )}
        
        <div>
          <strong>Todas as Contas no Sistema ({allAccounts.length}):</strong>
          <div className="max-h-60 overflow-y-auto mt-2">
            {allAccounts.map((account) => (
              <div key={account.id} className="bg-gray-50 p-2 rounded mb-2 text-xs">
                <div><strong>Nome:</strong> {account.habbo_name}</div>
                <div><strong>ID:</strong> {account.habbo_id}</div>
                <div><strong>Admin:</strong> {account.is_admin ? '✅' : '❌'}</div>
                <div><strong>Criado:</strong> {new Date(account.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadAccounts} size="sm">
            🔄 Atualizar
          </Button>
          <Button onClick={cleanupDuplicates} variant="destructive" size="sm">
            🗑️ Limpar Duplicatas Beebop
          </Button>
        </div>
      </div>
    </Card>
  );
};
