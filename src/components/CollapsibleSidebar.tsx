import React, { useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const CollapsibleSidebar = ({ activeSection, setActiveSection }: CollapsibleSidebarProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: () => <img src="/assets/Hmenu.png" alt="Home" className="w-8 h-8 flex-shrink-0" />,
      path: '/'
    },
    { 
      id: 'noticias', 
      label: 'Notícias', 
      icon: () => <img src="/assets/BatePapo1.png" alt="Notícias" className="w-8 h-8 flex-shrink-0" />,
      path: '/noticias'
    },
    { 
      id: 'eventos', 
      label: 'Eventos', 
      icon: () => <img src="/assets/eventos.png" alt="Eventos" className="w-8 h-8 flex-shrink-0" />,
      path: '/eventos'
    },
    { 
      id: 'forum', 
      label: 'Fórum', 
      icon: () => <img src="/assets/BatePapo1.png" alt="Fórum" className="w-8 h-8 flex-shrink-0" />,
      path: '/forum'
    },
    { 
      id: 'catalogo', 
      label: 'Catálogo', 
      icon: () => <img src="/assets/Image 2422.png" alt="Catálogo" className="w-8 h-8 flex-shrink-0" />,
      path: '/catalogo'
    },
    { 
      id: 'emblemas', 
      label: 'Emblemas', 
      icon: () => <img src="/assets/1876__-6Ie.png" alt="Emblemas" className="w-8 h-8 flex-shrink-0" />,
      path: '/emblemas'
    },
    { 
      id: 'editor', 
      label: 'Editor de Visuais', 
      icon: () => <img src="/assets/editorvisuais.png" alt="Editor" className="w-8 h-8 flex-shrink-0" />,
      path: '/editor'
    },
    { 
      id: 'mercado', 
      label: 'Mercado', 
      icon: () => <img src="/assets/Image 1574.png" alt="Mercado" className="w-8 h-8 flex-shrink-0" />,
      path: '/mercado'
    },
    { 
      id: 'ferramentas', 
      label: 'Ferramentas', 
      icon: () => <img src="/assets/wireds.png" alt="Ferramentas" className="w-8 h-8 flex-shrink-0" />,
      path: '/ferramentas'
    }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      <div className="flex">
        <DesktopSidebar 
          navItems={navItems} 
          currentPath={location.pathname} 
          onNavClick={handleNavClick}
        />
        <MobileHeader 
          navItems={navItems} 
          currentPath={location.pathname} 
          onNavClick={handleNavClick}
        />
      </div>
    </SidebarProvider>
  );
};

const DesktopSidebar = ({ 
  navItems, 
  currentPath, 
  onNavClick 
}: {
  navItems: any[];
  currentPath: string;
  onNavClick: (path: string) => void;
}) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.aside
      className="hidden md:flex md:flex-col bg-amber-50 shadow-xl min-h-screen flex-shrink-0"
      animate={{
        width: animate ? (open ? "320px" : "80px") : "320px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center p-4">
          {open ? (
            <img 
              src="/assets/habbohub.gif" 
              alt="HABBO HUB" 
              className="h-14 w-auto"
              onError={(e) => {
                e.currentTarget.src = "/assets/habbohub.png";
              }}
            />
          ) : (
            <img 
              src="/assets/hub.gif" 
              alt="H" 
              className="h-10 w-10"
              onError={(e) => {
                e.currentTarget.src = "/assets/hub.gif";
              }}
            />
          )}
        </div>

        {/* User Profile */}
        <div className="px-4 mb-6">
          <UserProfile collapsed={!open} />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2 px-4 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                onClick={() => onNavClick(item.path)}
                className={`
                  flex items-center transition-all duration-200 font-medium rounded-lg
                  ${isActive 
                    ? 'bg-sky-400 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                  }
                  ${!open ? 'px-2 py-3 justify-center w-16' : 'px-4 py-3'}
                `}
              >
                <div className={`flex-shrink-0 ${!open ? '' : 'mr-3'}`}>
                  {typeof Icon === 'function' ? <Icon /> : <Icon size={open ? 24 : 28} />}
                </div>
                <motion.span
                  animate={{
                    opacity: animate ? (open ? 1 : 0) : 1,
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                  }}
                  className="whitespace-nowrap flex-1 text-left"
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}
        </nav>

        {/* Premium Section */}
        <motion.div
          animate={{
            opacity: animate ? (open ? 1 : 0) : 1,
            display: animate ? (open ? "block" : "none") : "block",
          }}
          className="p-4 bg-white/80 backdrop-blur-sm mx-4 rounded-lg mb-4 shadow-sm"
        >
          <h3 className="font-bold text-gray-800 mb-2">Habbo Hub Premium</h3>
          <p className="text-sm text-gray-600 mb-3">Desbloqueie filtros avançados!</p>
          <button className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-yellow-700 hover:bg-yellow-600 transition-all duration-200 shadow-sm">
            Assine Já!
          </button>
        </motion.div>

        {/* Language Flags */}
        <div className="p-4 border-t border-amber-200">
          <div className="flex justify-center space-x-2">
            <button
              className="p-2 rounded-full transition-all duration-200 hover:scale-110 border-2 bg-white/80 border-gray-300 hover:bg-white hover:shadow-sm"
              title="Português"
            >
              <span className="text-xl">🇧🇷</span>
            </button>
            <button
              className="p-2 rounded-full transition-all duration-200 hover:scale-110 border-2 bg-white/80 border-gray-300 hover:bg-white hover:shadow-sm"
              title="Español"
            >
              <span className="text-xl">🇪🇸</span>
            </button>
            <button
              className="p-2 rounded-full transition-all duration-200 hover:scale-110 border-2 bg-white/80 border-gray-300 hover:bg-white hover:shadow-sm"
              title="English"
            >
              <span className="text-xl">🇬🇧</span>
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

const MobileHeader = ({ 
  navItems, 
  currentPath, 
  onNavClick 
}: {
  navItems: any[];
  currentPath: string;
  onNavClick: (path: string) => void;
}) => {
  const { open, setOpen } = useSidebar();

  return (
    <div className="md:hidden w-full">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b-2 border-amber-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <Logo />
        <div className="flex items-center space-x-3">
          <UserProfile collapsed={true} />
          <Menu
            className="text-gray-800 cursor-pointer w-6 h-6"
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>

      {/* Mobile Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50 border-t-2 border-amber-200 px-4 py-2 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavClick(item.path)}
                className={`
                  p-3 rounded-lg transition-all duration-200
                  ${currentPath === item.path 
                    ? 'bg-sky-400 shadow-md' 
                    : 'bg-transparent hover:bg-white/50'
                  }
                `}
              >
                {typeof Icon === 'function' ? <Icon /> : <Icon size={24} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-amber-50 p-6 z-40 flex flex-col"
            style={{ paddingTop: '80px', paddingBottom: '80px' }}
          >
            <div className="flex justify-between items-center mb-8">
              <Logo />
              <X
                className="text-gray-800 cursor-pointer w-6 h-6"
                onClick={() => setOpen(false)}
              />
            </div>
            
            <div className="mb-6">
              <UserProfile collapsed={false} />
            </div>

            <nav className="flex flex-col space-y-2 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                     onClick={() => {
                       onNavClick(item.path);
                       setOpen(false);
                     }}
                     className={`
                       flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                       ${currentPath === item.path 
                         ? 'bg-sky-400 text-white shadow-md' 
                         : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                       }
                     `}
                  >
                    {typeof Icon === 'function' ? <Icon /> : <Icon size={20} />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto p-4 border-t border-amber-200">
              <div className="flex justify-center space-x-2">
                <button className="p-2 rounded-full bg-white/80 border-2 border-gray-300">
                  <span className="text-xl">🇧🇷</span>
                </button>
                <button className="p-2 rounded-full bg-white/80 border-2 border-gray-300">
                  <span className="text-xl">🇪🇸</span>
                </button>
                <button className="p-2 rounded-full bg-white/80 border-2 border-gray-300">
                  <span className="text-xl">🇬🇧</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="font-normal flex flex-col items-center text-sm text-black">
      <img 
        src="/assets/habbohub.png" 
        alt="HABBO HUB" 
        className="mb-2 max-w-[140px] h-auto"
      />
    </div>
  );
};

const LogoIcon = () => {
  return (
    <div className="font-normal flex items-center justify-center">
      <img 
        src="/assets/Hmenu.png" 
        alt="H" 
        className="w-10 h-10"
      />
    </div>
  );
};