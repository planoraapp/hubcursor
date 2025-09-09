import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface HabboAccount {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  figureString: string;
  motto: string;
  email: string;
  ip_register: string;
  ip_current: string;
  account_created: string;
  last_login: string;
  last_online: string;
  is_banned: boolean;
  is_staff: boolean;
  is_hc: boolean;
  credits: number;
  role: string;
}

const AdminPanelPage = () => {
  const [accounts, setAccounts] = useState<HabboAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAccount, setEditingAccount] = useState<Partial<HabboAccount>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('*');

      if (error) throw error;

      setAccounts(data || []);
    } catch (error: any) {
      toast(`Erro ao buscar contas: ${error.message}`);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setEditingAccount(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setEditingAccount(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSaveAccount = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('habbo_accounts')
        .upsert([editingAccount]);

      if (error) throw error;

      toast('Conta salva com sucesso!');
      setEditingAccount({});
      // Refresh accounts list
    } catch (error: any) {
      toast(`Erro ao salvar conta: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('habbo_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      
      toast('Conta deletada com sucesso!');
    } catch (error: any) {
      toast(`Erro ao deletar conta: ${error.message}`);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.habbo_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="container mx-auto p-6 min-h-screen"
      style={{ 
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}
    >
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Contas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="grid gap-4">
                {filteredAccounts.map(account => (
                  <Card key={account.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{account.habbo_name}</h3>
                        <p className="text-sm text-gray-600">{account.email}</p>
                        <p className="text-sm text-gray-500">Hotel: {account.hotel}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingAccount(account)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {editingAccount.id && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Editando Conta</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="habbo_name">Nome Habbo</Label>
                      <Input
                        id="habbo_name"
                        value={editingAccount.habbo_name || ''}
                        onChange={(e) => handleInputChange('habbo_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={editingAccount.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_banned"
                        checked={editingAccount.is_banned || false}
                        onCheckedChange={(checked) => handleCheckboxChange('is_banned', checked as boolean)}
                      />
                      <Label htmlFor="is_banned">Banido</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_staff"
                        checked={editingAccount.is_staff || false}
                        onCheckedChange={(checked) => handleCheckboxChange('is_staff', checked as boolean)}
                      />
                      <Label htmlFor="is_staff">Staff</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_hc"
                        checked={editingAccount.is_hc || false}
                        onCheckedChange={(checked) => handleCheckboxChange('is_hc', checked as boolean)}
                      />
                      <Label htmlFor="is_hc">Habbo Club</Label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSaveAccount} disabled={isLoading}>
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setEditingAccount({})}>
                      Cancelar
                    </Button>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configurações em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;
