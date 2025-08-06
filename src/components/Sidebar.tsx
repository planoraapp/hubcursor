import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  BaggageClaim,
  Newspaper,
  Gamepad2,
  ShoppingBag,
  MessageSquare,
  Image,
  Cog6Tooth,
  DoorOpen,
  LucideIcon
} from "lucide-react"
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  habboName?: string;
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href }) => (
  <Link to={href} className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200">
    <Icon className="w-4 h-4 text-gray-500" />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </Link>
);

const UserProfile: React.FC<{ habboName: string }> = ({ habboName }) => (
  <div className="flex items-center space-x-4 py-4 px-6">
    <Avatar>
      <AvatarImage src={`https://www.habbo.com.br/habbo-imaging/avatarimage?size=l&user=${habboName}&action=wav&direction=2&head_direction=2&gesture=sml`} />
      <AvatarFallback>HH</AvatarFallback>
    </Avatar>
    <div>
      <h3 className="text-sm font-semibold text-gray-800">{habboName}</h3>
      <p className="text-xs text-gray-500">Habbo Membro</p>
    </div>
  </div>
);

export function Sidebar({ habboName }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast({
        title: "Sucesso",
        description: "Logout realizado com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || 'Erro ao fazer logout',
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden w-full justify-start pl-4">Abrir Menu</Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navegue pelo Habbo Hub.
          </SheetDescription>
        </SheetHeader>
        <Separator />

      {/* User Profile */}
      <UserProfile habboName={habboName || ''} />

        <Separator />
        <div className="py-4">
          <NavItem icon={Home} label="Início" href="/" />
          <NavItem icon={Newspaper} label="Notícias" href="/noticias" />
          <NavItem icon={Gamepad2} label="Eventos" href="/eventos" />
          <NavItem icon={ShoppingBag} label="Marketplace" href="/marketplace" />
          <NavItem icon={MessageSquare} label="Fórum" href="/forum" />
          <NavItem icon={Image} label="Emblemas" href="/emblemas" />
        </div>
        <Separator />
        <div className="py-4">
          <NavItem icon={Cog6Tooth} label="Ferramentas" href="/ferramentas" />
          <NavItem icon={LayoutDashboard} label="Catálogo" href="/catalogo" />
          <NavItem icon={User} label="Meu Perfil" href={`/profile/${habboName}`} />
          <NavItem icon={Settings} label="Configurações" href="/configuracoes" />
        </div>
        <Separator />
        <div className="py-4">
          <Button variant="ghost" className="w-full justify-start pl-4" onClick={handleLogout}>
            <DoorOpen className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sair</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
