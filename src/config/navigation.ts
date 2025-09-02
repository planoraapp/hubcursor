
import { 
  Home, 
  Users, 
  ShoppingBag, 
  Star, 
  Settings,
  PaintBucket,
  MessageSquare,
  User,
  BookOpen,
  Trophy,
  Gamepad2,
  LucideIcon
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  isNew?: boolean;
}

export const navigationConfig: MenuItem[] = [
  { id: 'inicio', label: 'Início', path: '/', icon: Home },
  { id: 'console', label: 'Habbo Console', path: '/console', icon: User, isNew: true },
  { id: 'editor', label: 'Editor Visual', path: '/editor', icon: PaintBucket },
  { id: 'catalogo', label: 'Catálogo', path: '/catalogo', icon: ShoppingBag },
  { id: 'forum', label: 'Fórum', path: '/forum', icon: MessageSquare },
  { id: 'tops', label: 'Ranking', path: '/tops', icon: Trophy },
  { id: 'marketplace', label: 'Marketplace', path: '/marketplace', icon: Star },
  { id: 'games', label: 'Jogos', path: '/games', icon: Gamepad2 },
  { id: 'blog', label: 'Blog', path: '/blog', icon: BookOpen },
  { id: 'configuracoes', label: 'Configurações', path: '/configuracoes', icon: Settings }
];
