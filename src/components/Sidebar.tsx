
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { AuthModal } from "./AuthModal";
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  ShoppingCart,
  Monitor,
  Menu,
  X
} from "lucide-react";

export const Sidebar = () => {
  const { isLoggedIn, habboAccount, logout } = useUnifiedAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Monitor, label: "Console", path: "/console" },
    { icon: ShoppingCart, label: "Mercado", path: "/mercado" },
  ];

  if (isLoggedIn && habboAccount) {
    menuItems.push({
      icon: User,
      label: "Meu Perfil",
      path: `/profile/${habboAccount.habbo_name}`
    });
  }

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-blue-400">HabboHub</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white hover:bg-slate-800"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          {isLoggedIn && habboAccount ? (
            <div className="space-y-2">
              {!isCollapsed && (
                <div className="text-sm text-slate-400">
                  Conectado como <span className="text-blue-400">{habboAccount.habbo_name}</span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-red-400 hover:bg-slate-800 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">Sair</span>}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <User className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">Entrar</span>}
            </Button>
          )}
        </div>
      </div>

      {/* Main content offset */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Content goes here */}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
