
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CalendarDays, Home, MessageSquare } from 'lucide-react';
import { getUserByName } from '../services/habboApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { generateUniqueUsername } from '@/utils/usernameUtils';

interface UserProfileModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  habboName: string;
  onStartConversation?: (targetHabboName: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  open, 
  setOpen, 
  habboName, 
  onStartConversation 
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { habboAccount } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!open || !habboName) return;
      
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

    fetchUserData();
  }, [open, habboName]);

  const handleGoToHome = () => {
    // Gerar nome único com prefixo do hotel
    const hotel = userData?.hotel || 'br';
    const domainUsername = generateUniqueUsername(habboName, hotel);
    navigate(`/home/${domainUsername}`);
    setOpen(false);
  };

  const handleSendMessage = () => {
    if (onStartConversation) {
      onStartConversation(habboName);
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white border-2 border-gray-900">
        <DialogHeader>
          <DialogTitle className="volter-font text-center text-xl">Perfil Habbo</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : userData ? (
          <div className="flex flex-col items-center space-y-4 p-4">
            <Avatar className="h-24 w-24 border-2 border-gray-900">
              <AvatarImage 
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${userData.figureString}&size=l&direction=2&head_direction=2&gesture=sml`} 
                alt={userData.name} 
              />
              <AvatarFallback className="text-lg font-bold bg-blue-100">
                {userData.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <h2 className="text-xl font-bold volter-font text-gray-900">{userData.name}</h2>
              {userData.motto && (
                <p className="text-sm text-gray-600 italic mt-1">"{userData.motto}"</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4" />
              <span>Membro desde: {new Date(userData.memberSince).toLocaleDateString('pt-BR')}</span>
            </div>

            {userData.profileVisible && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Emblemas:</span>
                  <Badge variant="secondary">{userData.selectedBadges?.length || 0}</Badge>
                </div>
                
                {userData.selectedBadges && userData.selectedBadges.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-24 overflow-y-auto">
                    {userData.selectedBadges.slice(0, 8).map((badge: any, index: number) => (
                      <div key={index} className="flex justify-center">
                        <img 
                          src={`https://images.habbo.com/c_images/album1584/${badge.code}.png`}
                          alt={badge.name}
                          className="w-8 h-8"
                          title={badge.name}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center">Nenhum emblema selecionado</p>
                )}
              </div>
            )}

            <div className="flex gap-2 w-full">
              <Button 
                onClick={handleGoToHome}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white volter-font"
              >
                <Home className="w-4 h-4 mr-2" />
                Visitar Home
              </Button>
              
              {habboAccount && habboAccount.habbo_name !== habboName && (
                <Button 
                  onClick={handleSendMessage}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white volter-font"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 space-y-4">
            <div className="text-6xl">😞</div>
            <p className="text-gray-600 text-center">
              Usuário não encontrado ou perfil privado
            </p>
          </div>
        )}
        
        <Button 
          onClick={() => setOpen(false)} 
          variant="outline" 
          className="w-full mt-4 border-gray-900"
        >
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
