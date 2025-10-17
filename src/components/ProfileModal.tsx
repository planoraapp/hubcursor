import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '../hooks/useAuth';
import { getUserByName } from '../services/habboApi';

export const ProfileModal = ({ open, setOpen, habboName }: { open: boolean, setOpen: (open: boolean) => void, habboName: string }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, habboAccount } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const data = await getUserByName(habboName);
        setUserData(data);
      } catch (error) {
                setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUserData();
    }
  }, [open, habboName]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Perfil Habbo</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p>Carregando...</p>
          </div>
        ) : userData ? (
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userData.name}&size=l&direction=2&head_direction=2&gesture=sml`} alt={userData.name} />
              <AvatarFallback>{userData.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <h2>{userData.name}</h2>
            <p className="text-sm text-gray-500">{userData.motto}</p>
            <Badge variant="secondary">
              Nível: {userData.profileVisibility}
            </Badge>
            <div className="flex space-x-2">
              <Button variant="outline">Seguir</Button>
              <Button>Enviar Mensagem</Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-48">
            <p>Usuário não encontrado.</p>
          </div>
        )}
        <Button onClick={() => setOpen(false)} className="w-full mt-4">Fechar</Button>
      </DialogContent>
    </Dialog>
  );
};
