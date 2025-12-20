import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * Hook para controlar a visibilidade e posicionamento sticky de um header baseado no scroll
 * @param scrollContainerRef - Referência para o container (pode ser o próprio elemento scrollável ou um pai)
 * @param hideThreshold - Threshold em pixels para esconder o header ao rolar para baixo (padrão: 50)
 * @param findScrollableSelector - Seletor CSS opcional para encontrar o elemento scrollável dentro do container
 */
export const useStickyHeader = (
  scrollContainerRef: RefObject<HTMLElement>,
  hideThreshold: number = 50,
  findScrollableSelector?: string
) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const lastScrollTopRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const scrollableElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Encontrar o elemento scrollável
    let scrollableElement: HTMLElement | null = null;
    if (findScrollableSelector) {
      scrollableElement = container.querySelector(findScrollableSelector) as HTMLElement;
    } else {
      // Verificar se o próprio container é scrollável
      const style = window.getComputedStyle(container);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll' || container.scrollHeight > container.clientHeight) {
        scrollableElement = container;
      } else {
        // Procurar por elemento com overflow-y-auto dentro do container
        scrollableElement = container.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
      }
    }

    if (!scrollableElement) return;
    scrollableElementRef.current = scrollableElement;

    const handleScroll = () => {
      // Cancelar frame anterior se existir
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Usar requestAnimationFrame para melhor performance
      rafIdRef.current = requestAnimationFrame(() => {
        const element = scrollableElementRef.current;
        if (!element) return;

        const currentScrollTop = element.scrollTop;
        const lastScrollTop = lastScrollTopRef.current;

        // Sempre mostrar quando está no topo (não fixo)
        if (currentScrollTop === 0) {
          setIsHeaderVisible(true);
          setIsHeaderFixed(false);
        } 
        // Esconder ao rolar para baixo (após threshold)
        else if (currentScrollTop > lastScrollTop && currentScrollTop > hideThreshold) {
          setIsHeaderVisible(false);
          setIsHeaderFixed(false);
        } 
        // Mostrar fixo no topo ao rolar para cima (mas não está no topo)
        else if (currentScrollTop < lastScrollTop && currentScrollTop > 0) {
          setIsHeaderVisible(true);
          setIsHeaderFixed(true);
        }

        lastScrollTopRef.current = currentScrollTop;
      });
    };

    // Usar um pequeno delay para garantir que o elemento está renderizado (especialmente para PhotosTab)
    const timeoutId = setTimeout(() => {
      scrollableElement?.addEventListener('scroll', handleScroll, { passive: true });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      scrollableElement?.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [scrollContainerRef, hideThreshold, findScrollableSelector]);

  return { isHeaderVisible, isHeaderFixed };
};

