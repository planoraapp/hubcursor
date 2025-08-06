
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { User } from 'lucide-react';

interface UserLoginModalProps {
  children: React.ReactNode;
}

export const UserLoginModal = ({ children }: UserLoginModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [habboName, setHabboName] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();
  const { signInWithHabbo } = useSupabaseAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habboName.trim() || !password) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu nome Habbo e senha.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Buscar conta vinculada
      const { data: accounts, error } = await supabase
        .from('habbo_accounts')
        .select('*')
        .ilike('habbo_name', habboName)
        .single();

      if (error || !accounts) {
        toast({
          title: "Conta não encontrada",
          description: "Não foi encontrada uma conta vinculada para este nome Habbo.",
          variant: "destructive"
        });
        return;
      }

      await signInWithHabbo(accounts.habbo_id, password);
      
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });
      
      setIsOpen(false);
      setHabboName('');
      setPassword('');
      
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center volter-font">Login Habbo Hub</DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="volter-font">Login Rápido</TabsTrigger>
                <TabsTrigger value="register" className="volter-font">Primeiro Acesso</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Habbo:</label>
                    <Input
                      type="text"
                      value={habboName}
                      onChange={(e) => setHabboName(e.target.value)}
                      placeholder="Digite seu nome Habbo"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Senha:</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha do Habbo Hub"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border">
                  <User className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 volter-font">
                    Para criar sua primeira conta no Habbo Hub, você precisará fazer a verificação completa.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/connect-habbo';
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
                >
                  Ir para Verificação Completa
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
