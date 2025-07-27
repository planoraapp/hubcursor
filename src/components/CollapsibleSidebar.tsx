import React, { useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Home, Newspaper, Calendar, MessageSquare, ShoppingCart, Shield, Palette, Store, Wrench } from 'lucide-react';
import { UserProfile } from './UserProfile';
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
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: '/assets/home.png',
      path: '/'
    },
    { 
      id: 'noticias', 
      label: 'Notícias', 
      icon: '/assets/news.png',
      path: '/noticias'
    },
    { 
      id: 'eventos', 
      label: 'Eventos', 
      icon: '/assets/eventos.png',
      path: '/eventos'
    },
    { 
      id: 'forum', 
      label: 'Fórum', 
      icon: '/assets/BatePapo1.png',
      path: '/forum'
    },
    { 
      id: 'catalogo', 
      label: 'Catálogo', 
      icon: '/assets/Image 2422.png',
      path: '/catalogo'
    },
    { 
      id: 'emblemas', 
      label: 'Emblemas', 
      icon: '/assets/emblemas.png',
      path: '/emblemas'
    },
    { 
      id: 'editor', 
      label: 'Editor de Visuais', 
      icon: '/assets/editorvisuais.png',
      path: '/editor'
    },
    { 
      id: 'mercado', 
      label: 'Mercado', 
      icon: '/assets/purse.gif',
      path: '/mercado'
    },
    { 
      id: 'ferramentas', 
      label: 'Ferramentas', 
      icon: '/assets/ferramentas.png',
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
            <div className="text-center">
              <img 
                src="/assets/habbohub.gif" 
                alt="HABBO HUB" 
                className="max-w-[180px] h-auto"
              />
            </div>
          ) : (
            <div className="text-center w-20">
              <img 
                src="/assets/hub.gif" 
                alt="HUB" 
                className="w-full h-auto"
              />
            </div>
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
                  flex items-center transition-all duration-200 font-medium rounded-lg border-0 outline-0
                  ${isActive 
                    ? 'bg-gray-300 text-gray-800 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                  }
                  ${!open ? 'p-0 justify-center w-16 h-16' : 'px-4 py-3'}
                `}
              >
                <div className={`${!open ? 'w-full h-full flex items-center justify-center' : 'flex-shrink-0 mr-3'}`}>
                  {typeof item.icon === 'string' ? (
                    <img 
                      src={item.icon} 
                      alt={item.label} 
                      className={`${open ? 'w-6 h-6' : 'w-8 h-8'} object-contain`}
                    />
                  ) : (
                    <Icon size={open ? 24 : 32} />
                  )}
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
        <img 
          src="/assets/habbohub.gif" 
          alt="HABBO HUB" 
          className="h-8 w-auto"
        />
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
            return (
              <button
                key={item.id}
                onClick={() => onNavClick(item.path)}
                className={`
                  w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 border-0 outline-0 p-0
                  ${currentPath === item.path 
                    ? 'bg-gray-300 shadow-md' 
                    : 'bg-transparent hover:bg-white/50'
                  }
                `}
              >
                {typeof item.icon === 'string' ? (
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <item.icon size={32} />
                )}
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
              <img 
                src="/assets/habbohub.gif" 
                alt="HABBO HUB" 
                className="h-8 w-auto"
              />
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
                          ? 'bg-gray-300 text-gray-800 shadow-md' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                        }
                     `}
                  >
                    {typeof item.icon === 'string' ? (
                      <img 
                        src={item.icon} 
                        alt={item.label} 
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <item.icon size={20} />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Logo = () => {
  return (
    <img 
      src="/assets/habbohub.gif" 
      alt="HABBO HUB" 
      className="h-8 w-auto"
    />
  );
};