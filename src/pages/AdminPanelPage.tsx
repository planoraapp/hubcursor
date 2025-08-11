import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

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
  last_login: string;
  referral_code: string;
  referrer_code: string;
  account_created: string;
  is_banned: boolean;
  is_staff: boolean;
  is_hc: boolean;
  role: string;
}

const HOTELS = ['com', 'com.br', 'de', 'es', 'fr', 'it', 'nl', 'fi', 'se', 'com.tr'];

const AdminPanelPage = () => {
  const [users, setUsers] = useState<HabboAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('com');
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<HabboAccount>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [selectedHotel]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('habbo_accounts')
        .select('*')
        .eq('hotel', selectedHotel);

      if (searchTerm) {
        query = query.ilike('habbo_name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Error!",
        description: "Failed to fetch users.",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleHotelChange = (hotel: string) => {
    setSelectedHotel(hotel);
    setSearchTerm(''); // Reset search term when hotel changes
  };

  const handleEditClick = (user: HabboAccount) => {
    setEditUserId(user.id);
    setEditFormData({ ...user });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserUpdate = async (userId: string, updates: any) => {
    try {
      // Remove the 'role' property from updates if it exists
      const { role, ...validUpdates } = updates;
      
      const { data, error } = await supabase
        .from('habbo_accounts')
        .update(validUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...validUpdates } : user
      ));

      toast.success('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId) return;

    await handleUserUpdate(editUserId, editFormData);
    setEditUserId(null); // Close the edit form
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('habbo_accounts')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      toast.success('Usuário deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast.error('Erro ao deletar usuário');
    }
  };

  const handleCopyReferralCode = (referralCode: string) => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Código de referral copiado!');
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Painel de Administração</h1>

      {/* Search and Hotel Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="search">Buscar Usuário:</Label>
          <Input
            type="text"
            id="search"
            placeholder="Nome do Habbo"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="hotel">Selecionar Hotel:</Label>
          <Select value={selectedHotel} onValueChange={handleHotelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Hotel" />
            </SelectTrigger>
            <SelectContent>
              {HOTELS.map(hotel => (
                <SelectItem key={hotel} value={hotel}>{hotel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Lista de usuários do hotel {selectedHotel}.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Habbo Name</TableHead>
                <TableHead>Habbo ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>IP Registro</TableHead>
                <TableHead>Banido?</TableHead>
                <TableHead>Staff?</TableHead>
                <TableHead>HC?</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.habbo_name}</TableCell>
                  <TableCell>{user.habbo_id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.ip_register}</TableCell>
                  <TableCell>{user.is_banned ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{user.is_staff ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{user.is_hc ? 'Sim' : 'Não'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyReferralCode(user.referral_code)}>
                          <Copy className="mr-2 h-4 w-4" /> Copiar Referral
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-500 focus:text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" /> Deletar
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá deletar o usuário permanentemente.
                                Tem certeza que deseja continuar?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit User Form */}
      {editUserId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Editar Usuário</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="habbo_name">Habbo Name</Label>
                <Input
                  type="text"
                  id="habbo_name"
                  name="habbo_name"
                  value={(editFormData.habbo_name || '') as string}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={(editFormData.email || '') as string}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="is_banned">Banido?</Label>
                <Checkbox
                  id="is_banned"
                  name="is_banned"
                  checked={editFormData.is_banned || false}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_banned: checked }))}
                />
              </div>
              <div>
                <Label htmlFor="is_staff">Staff?</Label>
                <Checkbox
                  id="is_staff"
                  name="is_staff"
                  checked={editFormData.is_staff || false}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_staff: checked }))}
                />
              </div>
              <div>
                <Label htmlFor="is_hc">HC?</Label>
                <Checkbox
                  id="is_hc"
                  name="is_hc"
                  checked={editFormData.is_hc || false}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_hc: checked }))}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="secondary" onClick={() => setEditUserId(null)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
