import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import SimpleBadgeImage from './SimpleBadgeImage';
// import realBadgeDescriptions from '@/data/real-badge-descriptions.json';
// import fullBadgeInfo from '@/data/full-badge-info.json';

interface BadgeTooltipProps {
  code: string;
  name?: string;
  description?: string;
  categories?: string[];
  countries?: string[];
  children: React.ReactNode;
  showOnHover?: boolean;
  showOnClick?: boolean;
}

const BadgeTooltip = ({ 
  code, 
  name, 
  description, 
  categories = [],
  countries = [],
  children, 
  showOnHover = true,
  showOnClick = true 
}: BadgeTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHovering = useRef(false);

  // Função para obter descrição baseada no código
  const getBadgeDescription = (badgeCode: string): string => {
    // Se temos descrição do banco, usar ela
    if (description) {
      return description;
    }
    
    // Primeiro, buscar descrição real da API
    if (realBadgeDescriptions[badgeCode as keyof typeof realBadgeDescriptions]) {
      return realBadgeDescriptions[badgeCode as keyof typeof realBadgeDescriptions];
    }

    // Buscar por prefixo nas descrições reais
    for (const [prefix, desc] of Object.entries(realBadgeDescriptions)) {
      if (badgeCode.startsWith(prefix)) {
        return desc;
      }
    }

    // Fallback para descrições baseadas em padrões
    if (badgeCode.includes('ACH_')) {
      return 'Conquista do Habbo Hotel';
    }
    if (badgeCode.startsWith('BR')) {
      return 'Emblema do Brasil';
    }
    if (badgeCode.startsWith('US')) {
      return 'Emblema dos Estados Unidos';
    }
    if (badgeCode.startsWith('ES')) {
      return 'Emblema da Espanha';
    }
    if (badgeCode.startsWith('DE')) {
      return 'Emblema da Alemanha';
    }
    if (badgeCode.startsWith('UK')) {
      return 'Emblema do Reino Unido';
    }
    if (badgeCode.startsWith('FR')) {
      return 'Emblema da França';
    }
    if (badgeCode.startsWith('IT')) {
      return 'Emblema da Itália';
    }
    if (badgeCode.startsWith('NL')) {
      return 'Emblema da Holanda';
    }
    if (badgeCode.startsWith('NB')) {
      return 'Emblema Nomeado';
    }
    if (badgeCode.startsWith('HWS')) {
      return 'Habbo Winter Special';
    }
    if (badgeCode.startsWith('WUP')) {
      return 'Wake Up Party';
    }

    return `Emblema ${badgeCode}`;
  };

  // Função para obter nome real do emblema
  const getBadgeName = (badgeCode: string): string => {
    if (fullBadgeInfo[badgeCode as keyof typeof fullBadgeInfo]) {
      return fullBadgeInfo[badgeCode as keyof typeof fullBadgeInfo].name;
    }
    return badgeCode;
  };

  // Função para calcular posição do tooltip
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    // Encontrar o container do modal (DialogContent)
    const modalContent = triggerRef.current.closest('[data-radix-dialog-content]') as HTMLElement;
    if (!modalContent) return;

    const modalRect = modalContent.getBoundingClientRect();
    
    // Margem de segurança
    const margin = 20;

    // Posição inicial: acima do badge, centralizado
    let x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
    let y = triggerRect.top - tooltipRect.height - 15;

    // Ajustar horizontalmente para ficar dentro do modal
    if (x < modalRect.left + margin) {
      x = modalRect.left + margin;
    } else if (x + tooltipRect.width > modalRect.right - margin) {
      x = modalRect.right - tooltipRect.width - margin;
    }

    // Ajustar verticalmente para ficar dentro do modal
    if (y < modalRect.top + margin) {
      y = triggerRect.bottom + 15; // Mostrar abaixo
      
      // Se também não couber abaixo, centralizar verticalmente no modal
      if (y + tooltipRect.height > modalRect.bottom - margin) {
        y = modalRect.top + (modalRect.height - tooltipRect.height) / 2;
      }
    }

    setPosition({ x, y });
  }, []);

  // Mostrar tooltip
  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    isHovering.current = true;
    setIsVisible(true);
  }, []);

  // Esconder tooltip com delay
  const hideTooltip = useCallback(() => {
    isHovering.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (!isHovering.current) {
        setIsVisible(false);
      }
    }, 200); // Delay de 200ms
  }, []);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (showOnHover) {
      showTooltip();
    }
  }, [showOnHover, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (showOnHover) {
      hideTooltip();
    }
  }, [showOnHover, hideTooltip]);

  const handleClick = useCallback(() => {
    if (showOnClick) {
      if (isVisible) {
        setIsVisible(false);
      } else {
        showTooltip();
      }
    }
  }, [showOnClick, isVisible, showTooltip]);

  // Atualizar posição quando tooltip é mostrado
  useEffect(() => {
    if (isVisible) {
      // Pequeno delay para garantir que o tooltip foi renderizado
      const timer = setTimeout(() => {
        calculatePosition();
      }, 10);
      
      // Adicionar listeners para reposicionar quando necessário
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      
      // Adicionar listener no modal se existir
      const modalContent = triggerRef.current?.closest('[data-radix-dialog-content]');
      if (modalContent) {
        modalContent.addEventListener('scroll', handleScroll);
      }
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
        if (modalContent) {
          modalContent.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [isVisible, calculatePosition]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const badgeDescription = description || getBadgeDescription(code);
  const badgeName = name || getBadgeName(code);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="relative"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 max-w-xs pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="flex items-start space-x-3">
            <SimpleBadgeImage 
              code={code} 
              name={name || code}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-bold text-gray-900 volter-font text-sm">
                  {name || code}
                </h3>
              </div>
              <p className="text-gray-600 text-xs volter-font mb-2">
                {badgeDescription}
              </p>
              
              {/* Categorias */}
              {categories && categories.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 volter-font mb-1">Categorias:</div>
                  <div className="flex flex-wrap gap-1">
                    {categories.map((cat, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Países */}
              {countries && countries.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 volter-font mb-1">Países:</div>
                  <div className="flex flex-wrap gap-1">
                    {countries.map((country, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 volter-font">
                Código: <span className="font-mono bg-gray-100 px-1 rounded">{code}</span>
              </div>
              <div className="mt-2 text-xs text-blue-600 volter-font">
                Clique para copiar o código
              </div>
            </div>
          </div>
          
          {/* Seta do tooltip */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300"></div>
        </div>
      )}
    </>
  );
};

export default BadgeTooltip;