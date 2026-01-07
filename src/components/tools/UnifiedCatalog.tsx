import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Package, 
  Utensils, 
  Coffee, 
  Candy, 
  Wrench, 
  Smartphone, 
  RefreshCw, 
  Download, 
  Filter, 
  Eye, 
  Zap, 
  AlertCircle,
  Database,
  Globe,
  Image as ImageIcon,
  Copy,
  Link
} from 'lucide-react';
import { habboApiService, HabboHanditem, HabboFurni } from '@/services/HabboAPIService';
import { habboDataExtractor, ExtractedHanditem } from '@/utils/habboDataExtractor';
import { handitemSyncService, HanditemData } from '@/services/HanditemSyncService';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';
import { avatarPreview } from '@/utils/avatarPreview';
import { useAuth } from '@/hooks/useAuth';
import { extractGenderFromFigureString } from '@/utils/userNormalizer';
import * as handitemImages from './handitemImages';
import { handitemActionMapper } from '@/utils/handitemActionMapper';

interface UnifiedCatalogProps {
  onHanditemSelect?: (handitem: HabboHanditem) => void;
  onFurniSelect?: (furni: HabboFurni) => void;
  externalSearchTerm?: string; // quando fornecido, usa busca externa e esconde input
  hideHeader?: boolean; // oculta barra de busca/ações e filtros de categoria
}

export const UnifiedCatalog: React.FC<UnifiedCatalogProps> = ({ 
  onHanditemSelect, 
  onFurniSelect,
  externalSearchTerm,
  hideHeader
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [handitems, setHanditems] = useState<HabboHanditem[]>([]);
  const [syncedHanditems, setSyncedHanditems] = useState<HanditemData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedHanditems, setCopiedHanditems] = useState<Set<number>>(new Set());
  const [expandedHanditemId, setExpandedHanditemId] = useState<number | null>(null);
  const handitemsContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language } = useI18n();
  const { habboAccount } = useAuth();

  // Mapeamento de categorias para handitems representativos (IDs)
  const CATEGORY_HANDITEM_IDS: { [key: string]: number } = {
    'Todos': 0, // Sem ícone para "Todos"
    'Alimentos': 1, // Cenoura
    'Bebidas': 2, // Café
    'Doces': 5, // Sorvete
    'Utensílios': 20, // Lata de Bubblejuice (ou outro utensílio)
    'Eletrônicos': 244, // Celular
    'Outros': 1099 // Ursinho Teddy (ou outro item)
  };

  // Categorias para handitems
  const HANDITEM_CATEGORIES = {
    'Todos': { label: 'Todos', icon: Package },
    'Alimentos': { label: 'Alimentos', icon: Utensils },
    'Bebidas': { label: 'Bebidas', icon: Coffee },
    'Doces': { label: 'Doces', icon: Candy },
    'Utensílios': { label: 'Utensílios', icon: Wrench },
    'Eletrônicos': { label: 'Eletrônicos', icon: Smartphone },
    'Outros': { label: 'Outros', icon: Globe }
  };

  // Função para obter a URL da imagem do handitem representativo da categoria
  const getCategoryHanditemImage = (categoryKey: string): string | null => {
    const handitemId = CATEGORY_HANDITEM_IDS[categoryKey];
    if (!handitemId || handitemId === 0) return null;
    
    // Usar a função de resolução de imagem diretamente
    try {
      const imageUrl = handitemImages.getHanditemImageById(handitemId);
      return imageUrl && !imageUrl.includes('placeholder') ? imageUrl : null;
    } catch {
      return null;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Debounce para evitar re-renderizações excessivas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (handitems.length > 0) {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [handitems.length]);

  // Centralizar a janela no handitem clicado quando expandido
  useLayoutEffect(() => {
    if (expandedHanditemId !== null && handitemsContainerRef.current) {
      const container = handitemsContainerRef.current;
      
      const centerItem = () => {
        if (!container) return;
        
        // Encontrar o card do handitem expandido
        const card = container.querySelector(`[data-handitem-id="${expandedHanditemId}"]`) as HTMLElement;
        if (!card) return;
        
        // Centralizar o handitem na viewport usando scrollIntoView
        card.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      };

      // Executar após um pequeno delay para garantir que o DOM esteja atualizado
      const timeout = setTimeout(() => {
        centerItem();
      }, 10);

      // Também executar após delay maior para garantir que funcione mesmo com scroll lento
      const timeout2 = setTimeout(() => {
        centerItem();
      }, 300);

      return () => {
        clearTimeout(timeout);
        clearTimeout(timeout2);
      };
    }
  }, [expandedHanditemId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Carregar handitems sincronizados (com traduções e novos)
      const synced = await handitemSyncService.sync();
      setSyncedHanditems(synced);
      
      // 2. Converter para formato HabboHanditem para compatibilidade
      const convertedHanditems: (HabboHanditem & { category?: string; isNew?: boolean })[] = synced.map(item => ({
        id: item.id,
        name: item.names[language] || item.names.en || item.names.pt,
        type: item.id >= 1000 ? 'CarryItem' : 'UseItem',
        assetPrefix: item.id >= 1000 ? 'crr' : 'drk',
        state: item.id >= 1000 ? 'cri' : 'usei',
        category: 'outros', // Será categorizado depois
        isNew: item.isNew || false
      }));
      
      setHanditems(convertedHanditems);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados sincronizados!",
        description: `Encontrados ${synced.length} handitems (${synced.filter(h => h.isNew).length} novos)`,
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      
      // Fallback: tentar carregar do arquivo local
      try {
        const response = await fetch('/handitems/handitems.json');
        const localData = await response.json();
        const localHanditems: HabboHanditem[] = localData.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: 'outros'
        }));
        setHanditems(localHanditems);
        toast({
          title: "Dados carregados (modo offline)",
          description: `Usando dados locais: ${localHanditems.length} handitems`,
        });
      } catch (fallbackError) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar handitems",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const extractData = async () => {
    setIsExtracting(true);
    try {
            const report = await habboApiService.discoverHanditemsWithImages();
      
      setHanditems(report.handitems);
      setLastUpdate(new Date());
      
      toast({
        title: "Extração concluída!",
        description: `Descobertos ${report.totalHanditems} handitems`,
      });
      
          } catch (error) {
            toast({
        title: "Erro na extração",
        description: "Não foi possível extrair dados dos servidores do Habbo",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Filtrar handitems
  const effectiveSearchTerm = externalSearchTerm ?? searchTerm;

  const filteredHanditems = useMemo(() => {
    // Usar syncedHanditems se disponível, senão usar handitems
    const sourceItems: (HabboHanditem & { category?: string; isNew?: boolean })[] = syncedHanditems.length > 0 
      ? syncedHanditems.map(item => ({
          id: item.id,
          name: item.names[language] || item.names.en || item.names.pt,
          type: item.id >= 1000 ? 'CarryItem' : 'UseItem',
          assetPrefix: item.id >= 1000 ? 'crr' : 'drk',
          state: item.id >= 1000 ? 'cri' : 'usei',
          category: 'outros',
          isNew: item.isNew || false
        }))
      : handitems.map(item => ({
          ...item,
          category: (item as any).category || 'outros',
          isNew: false
        }));

    // Remover duplicatas: manter apenas o item com o ID mais alto (mais recente)
    // Baseado na lista do external_flash_texts, IDs maiores são mais recentes e corretos
    const itemsMap = new Map<string, (HabboHanditem & { category?: string; isNew?: boolean })>();
    
    sourceItems.forEach(item => {
      if (item.id === 0) return; // Pular "Nenhum"
      
      // Normalizar nome para comparação (remover acentos, espaços extras, etc)
      const nameKey = item.name.toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s+/g, ' '); // Normaliza espaços
      
      const existing = itemsMap.get(nameKey);
      
      // Se já existe, manter o que tem o ID maior (mais recente/correto)
      // Exemplo: "Spray" ID 65 vs ID 1060 -> manter 1060
      if (!existing || item.id > existing.id) {
        itemsMap.set(nameKey, item);
      }
    });

    let filtered = Array.from(itemsMap.values());

    // Ordenar: novos primeiro, depois por ID
    filtered = filtered.sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return b.id - a.id; // IDs maiores primeiro (mais recentes)
    });

    // Filtro por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(item => {
        const name = item.name.toLowerCase();
        switch (selectedCategory) {
          case 'Alimentos':
            return name.includes('hambúrguer') || name.includes('pizza') || name.includes('sanduíche') || 
                   name.includes('frango') || name.includes('carne') || name.includes('peixe') ||
                   name.includes('vegetal') || name.includes('salada') || name.includes('sopa') ||
                   name.includes('cenoura') || name.includes('tomate') || name.includes('queijo') ||
                   name.includes('pão') || name.includes('fruta') || name.includes('banana') ||
                   name.includes('maçã') || name.includes('laranja') || name.includes('pêra');
          case 'Bebidas':
            return name.includes('café') || name.includes('suco') || name.includes('água') || 
                   name.includes('leite') || name.includes('chá') || name.includes('refrigerante') ||
                   name.includes('bebida') || name.includes('drink') || name.includes('copo') ||
                   name.includes('champanhe') || name.includes('energético') || name.includes('milkshake');
          case 'Doces':
            return name.includes('doce') || name.includes('açúcar') || name.includes('chocolate') || 
                   name.includes('balas') || name.includes('pirulito') || name.includes('biscoito') ||
                   name.includes('bolo') || name.includes('torta') || name.includes('sorvete') ||
                   name.includes('goma') || name.includes('chiclete') || name.includes('algodão');
          case 'Utensílios':
            return name.includes('garfo') || name.includes('faca') || name.includes('colher') || 
                   name.includes('prato') || name.includes('copo') || name.includes('xícara') ||
                   name.includes('tigela') || name.includes('panela') || name.includes('talher') ||
                   name.includes('livro') || name.includes('prancheta') || name.includes('pincel');
          case 'Eletrônicos':
            return name.includes('celular') || name.includes('telefone') || name.includes('computador') || 
                   name.includes('tablet') || name.includes('câmera') || name.includes('rádio') ||
                   name.includes('tv') || name.includes('vídeo') || name.includes('eletrônico') ||
                   name.includes('hipad') || name.includes('h-phone') || name.includes('microfone');
          case 'Outros':
            return !name.includes('hambúrguer') && !name.includes('pizza') && !name.includes('sanduíche') && 
                   !name.includes('café') && !name.includes('suco') && !name.includes('água') &&
                   !name.includes('doce') && !name.includes('açúcar') && !name.includes('chocolate') &&
                   !name.includes('garfo') && !name.includes('faca') && !name.includes('colher') &&
                   !name.includes('celular') && !name.includes('telefone') && !name.includes('computador');
          default:
            return true;
        }
      });
    }

    // Filtro por busca
    if (effectiveSearchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
        item.id.toString().includes(effectiveSearchTerm)
      );
    }

    return filtered;
  }, [syncedHanditems, handitems, selectedCategory, effectiveSearchTerm, language]);


  // Cache para mapeamento reverso do XML (value -> id)
  const reverseMappingCache = useRef<Map<number, { drk?: number; crr?: number; type?: 'drk' | 'crr' }>>(new Map());
  const reverseMappingLoading = useRef<Promise<void> | null>(null);

  // Obter mapeamento reverso do HabboAvatarActions.xml
  // Exemplo: Se <param id="1074" value="175"/>, então getReverseMapping(175) retorna { crr: 1074, type: 'crr' }
  const getReverseMappedValue = async (handitemId: number): Promise<{ drk?: number; crr?: number; type?: 'drk' | 'crr' }> => {
    // Verificar cache primeiro
    if (reverseMappingCache.current.has(handitemId)) {
      return reverseMappingCache.current.get(handitemId)!;
    }

    // Se já está carregando, aguardar
    if (reverseMappingLoading.current) {
      await reverseMappingLoading.current;
      if (reverseMappingCache.current.has(handitemId)) {
        return reverseMappingCache.current.get(handitemId)!;
      }
    }

    // Carregar mapeamento do XML
    const loadMapping = async () => {
      try {
        const response = await fetch('/handitems/gordon/flash-assets-PRODUCTION-202509092352-15493374/HabboAvatarActions.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Processar todos os mapeamentos de uma vez
        const allMappings = new Map<number, { drk?: number; crr?: number; type?: 'drk' | 'crr' }>();
        
        // Buscar em UseItem (drk)
        const useItemAction = xmlDoc.querySelector('action[id="UseItem"]');
        if (useItemAction) {
          const params = useItemAction.querySelectorAll('param');
          params.forEach(param => {
            const id = param.getAttribute('id');
            const value = param.getAttribute('value');
            if (id && value && id !== 'default') {
              const gameId = parseInt(value, 10);
              const mappedValue = parseInt(id, 10);
              if (!allMappings.has(gameId)) {
                allMappings.set(gameId, {});
              }
              const mapping = allMappings.get(gameId)!;
              mapping.drk = mappedValue;
              if (!mapping.type) mapping.type = 'drk';
            }
          });
        }
        
        // Buscar em CarryItem (crr)
        const carryItemAction = xmlDoc.querySelector('action[id="CarryItem"]');
        if (carryItemAction) {
          const params = carryItemAction.querySelectorAll('param');
          params.forEach(param => {
            const id = param.getAttribute('id');
            const value = param.getAttribute('value');
            if (id && value && id !== 'default') {
              const gameId = parseInt(value, 10);
              const mappedValue = parseInt(id, 10);
              if (!allMappings.has(gameId)) {
                allMappings.set(gameId, {});
              }
              const mapping = allMappings.get(gameId)!;
              mapping.crr = mappedValue;
              // Se já tem drk, manter drk como tipo principal, senão usar crr
              if (!mapping.type) mapping.type = 'crr';
            }
          });
        }
        
        // Armazenar no cache
        allMappings.forEach((value, key) => {
          reverseMappingCache.current.set(key, value);
        });
        
        console.log(`✅ Mapeamento reverso carregado: ${allMappings.size} handitems mapeados`);
      } catch (error) {
        console.error('⚠️ Erro ao carregar mapeamento reverso do XML:', error);
      }
    };

    reverseMappingLoading.current = loadMapping();
    await reverseMappingLoading.current;
    reverseMappingLoading.current = null;

    // Retornar do cache ou objeto vazio
    return reverseMappingCache.current.get(handitemId) || {};
  };

  // Obter URL da imagem do handitem usando imagens reais
  const getHanditemImageUrl = (handitem: HabboHanditem): string => {
  // Mapeamento de imagens reais de fontes oficiais
  const realImages: { [key: number]: string } = {
    // UseItems (drk) - para beber
    1: 'https://i.imgur.com/1BGBH0d.png', // Chá Refrescante
    2: 'https://i.imgur.com/1BGBH0d.png', // Suco
  3: 'https://i.imgur.com/IGVknDZ.png', // Cenoura
  4: 'https://i.imgur.com/8743wmb.png', // Sorvete de Baunilha
  5: 'https://i.imgur.com/Cfa2xdt.png', // Leite
  6: 'https://i.imgur.com/Cfa2xdt.png', // Groselha
  7: 'https://i.imgur.com/Cfa2xdt.png', // Água
  8: 'https://i.imgur.com/1BGBH0d.png', // Café
  9: 'https://i.imgur.com/1BGBH0d.png', // Café Descafeinado
  10: 'https://i.imgur.com/1BGBH0d.png', // café com leite
  11: 'https://i.imgur.com/1BGBH0d.png', // Mocaccino
  12: 'https://i.imgur.com/1BGBH0d.png', // Caffè Macchiato
  13: 'https://i.imgur.com/1BGBH0d.png', // Café Expresso
  14: 'https://i.imgur.com/1BGBH0d.png', // Café Preto
  15: 'https://i.imgur.com/1BGBH0d.png', // Cappuccino
  16: 'https://i.imgur.com/1BGBH0d.png', // Cappuccino
  17: 'https://i.imgur.com/1BGBH0d.png', // Café Java
  18: 'https://i.imgur.com/Cfa2xdt.png', // Água da Torneira
    19: 'https://i.imgur.com/sMTSwiG.png', // Suco Bubblejuice
  20: 'https://i.imgur.com/KKovhHi.png', // Câmera / Lata de Bubblejuice
  21: 'https://i.imgur.com/Uwby52g.png', // Hambúrger
  22: 'https://i.imgur.com/iW9Ub5D.png', // Habbo Limonada (Lime Habbo Soda)
  23: 'https://i.imgur.com/OdYeZ21.png', // Habbo Beterraba (Beetroot Habbo Soda)
    24: 'https://i.imgur.com/3JtoDrn.png', // Suco de Bolhas de 1978
  25: 'https://i.imgur.com/VTfFXla.png', // Poção do Amor
  26: 'https://i.imgur.com/SyjIrTP.png', // Calippo
  27: 'https://i.imgur.com/1BGBH0d.png', // Chá Árabe
  28: 'https://i.imgur.com/utYMHeX.png', // Saquê
  29: 'https://i.imgur.com/s05v9hF.png', // Suco de Tomate
  30: 'https://i.imgur.com/O51apy3.png', // Sorvete de chocolate
  31: 'https://i.imgur.com/xzQi9tn.png', // Espumante Rosa
  32: 'https://i.imgur.com/xzQi9tn.png', // Drink de Coco
  33: 'https://i.imgur.com/sMTSwiG.png', // Refrigerante 711
  34: 'https://i.imgur.com/egp6U90.png', // Peixe
  35: 'https://i.imgur.com/4qHA9BV.png', // Champanhe
  36: 'https://i.imgur.com/0u2ZtNJ.png', // Pêra
  37: 'https://i.imgur.com/VStOTCZ.png', // Pêssego Suculento
  38: 'https://i.imgur.com/pDRtHvO.png', // Laranja
  39: 'https://i.imgur.com/AkWndvc.png', // Fatia de Queijo
  40: 'https://i.imgur.com/gekvl8o.png', // Suco de Laranja
  41: 'https://i.imgur.com/1BGBH0d.png', // Café Gourmet
  42: 'https://i.imgur.com/6BKKJUd.png', // Refrigerante de Laranja
  43: 'https://i.imgur.com/KKovhHi.png', // Habbo Refri Geladinho
  44: 'https://i.imgur.com/2xypAeW.png', // Energético Astrobar
  45: 'https://i.imgur.com/Uwby52g.png', // Goma de Mascar Amarela
  46: 'https://i.imgur.com/iW9Ub5D.png', // Goma de Mascar Verde
  47: 'https://i.imgur.com/OdYeZ21.png', // Goma de Mascar Vermelha
  48: 'https://i.imgur.com/Qf6StN8.png', // Pirulito
  49: 'https://i.imgur.com/SU1NHAB.png', // Pote de Iogurte Manchado
  50: 'https://i.imgur.com/B1QltwH.png', // Garrafa de Suco de Bolhas
  51: 'https://i.imgur.com/th9ezI9.png', // Salgadinho Grefusa
  52: 'https://i.imgur.com/mhBVDFW.png', // Salgadinho Cheetos
  53: 'https://i.imgur.com/61rJtrb.png', // Xícara de Café Expresso
  54: 'https://i.imgur.com/8St10JR.png', // Tigela de Cereais
  55: 'https://i.imgur.com/1kBUAeJ.png', // Garrafa de Pepsi
  56: 'https://i.imgur.com/mhBVDFW.png', // Salgadinho Cheetos Hot-dog
  57: 'https://i.imgur.com/s05v9hF.png', // Refrigerante de Cereja
  58: 'https://i.imgur.com/xPRXcn9.png', // Sangue fresco
  59: 'https://i.imgur.com/1Qo9v0o.png', // Saco de Moedas
  60: 'https://i.imgur.com/ImwPJAa.png', // Castanhas
  61: 'https://i.imgur.com/I0VBDys.png', // Garrafinha de Suco de Laranja
  62: 'https://i.imgur.com/kRKUkAv.png', // Água Envenenada
  63: 'https://i.imgur.com/XSaqRZp.png', // Saco de Pipocas
  64: 'https://i.imgur.com/hLVm2nD.png', // Suco de Limão
  // ID 65 removido - duplicata de ID 1060 (Spray)
  66: 'https://i.imgur.com/JG2Zh9L.png', // Milkshake de Banana
  67: 'https://i.imgur.com/kjDvllH.png', // Chiclete Azul
  68: 'https://i.imgur.com/iOsm5GN.png', // Chiclete Rosa
  69: 'https://i.imgur.com/DsijL6T.png', // Chiclete Verde
  70: 'https://i.imgur.com/3vCJmzZ.png', // Coxa de frango
  71: 'https://i.imgur.com/Z01e7Vm.png', // Torrada
  72: 'https://i.imgur.com/oSWfOEa.png', // Garrafinha de Suco de Pêssego e Maçã
  73: 'https://i.imgur.com/OQSV1F9.png', // Eggnog
  74: 'https://i.imgur.com/ZsA4yEF.png', // Tinta Spray
  75: 'https://i.imgur.com/4UyBReh.png', // Sorvete de Morango
  76: 'https://i.imgur.com/T8q5q6Q.png', // Sorvete de Menta
  77: 'https://i.imgur.com/O51apy3.png', // Sorvete de Chocolate
  78: 'https://i.imgur.com/VIJmJ4J.png', // Algodão Doce Rosa
  79: 'https://i.imgur.com/2EumMVp.png', // Algodão Doce Azul
  80: 'https://i.imgur.com/eSb4TEY.png', // Cachorro-quente
  81: 'https://i.imgur.com/g5SNnOs.png', // Luneta
  82: 'https://i.imgur.com/0xvncjK.png', // Americano
  83: 'https://i.imgur.com/U5YTw0f.png', // Maçã Suculenta
  84: 'https://i.imgur.com/cs6AmF0.png', // Boneco de Biscoito de Gengibre
  85: 'https://i.imgur.com/gO34eGD.png', // Frappuccino
  86: 'https://i.imgur.com/aIAT8v8.png', // Caneca com Água
  87: 'https://i.imgur.com/HKDAdfM.png', // Rum
  88: 'https://i.imgur.com/1c9iAfB.png', // Cupcake
  89: 'https://i.imgur.com/vfJD4FN.png', // Champanhe Rosé
  90: 'https://i.imgur.com/0Fkh9OT.png', // Chá Oriental
  91: 'https://i.imgur.com/uGcEx03.png', // Pincel
  92: 'https://i.imgur.com/NC1DyxN.png', // Goma de Mascar Vermelho
  93: 'https://i.imgur.com/cMJ1aol.png', // Goma de Mascar Rosa
  94: 'https://i.imgur.com/uLvIkBE.png', // Goma de Mascar Verde
  95: 'https://i.imgur.com/XkwghzW.png', // Goma de Mascar Azul
  96: 'https://i.imgur.com/aOcQiGg.png', // Fatia de Bolo
  97: 'https://i.imgur.com/hVV1PqK.png', // Croissant
  98: 'https://i.imgur.com/84YSA2L.png', // Tomate
  99: 'https://i.imgur.com/OQaYwKn.png', // Beringela
  100: 'https://i.imgur.com/D3T1iDy.png', // Repolho
  101: 'https://i.imgur.com/GvMNtEd.png', // Suco Borbulhante
  102: 'https://i.imgur.com/lvfv9bg.png', // Energético
  103: 'https://i.imgur.com/6BKn94N.png', // Banana
  104: 'https://i.imgur.com/ag1c9TQ.png', // Abacate
  105: 'https://i.imgur.com/hiItqwI.png', // Uvas
  106: 'https://i.imgur.com/ugS8uM3.png', // Vitamina
  107: 'https://i.imgur.com/D4O5pwc.png', // Suco de Vegetais
  108: 'https://i.imgur.com/b9bHieW.png', // Haltere
  109: 'https://i.imgur.com/LRKks9w.png', // Hambúrguer
  110: 'https://i.imgur.com/lUD4B0r.png', // Carta
  111: 'https://i.imgur.com/nFJOkaj.png', // Carangueijo
  112: 'https://i.imgur.com/hzl8v5t.png', // Pimenta Malagueta
  113: 'https://i.imgur.com/eDnmJve.png', // Vitamina Cítrica
  114: 'https://i.imgur.com/OElK8Hq.png', // Vitamina Detox
  115: 'https://i.imgur.com/5L0GH2v.png', // Vitamina Framboesa
  116: 'https://i.imgur.com/Urwgzak.png', // Limão
  117: 'https://i.imgur.com/iZ6015l.png', // Cookie
  118: 'https://i.imgur.com/9rnCqKk.png', // Ramune Rosa
  119: 'https://i.imgur.com/fVs2mqq.png', // Ramune Azul
  120: 'https://i.imgur.com/zh86F72.png', // Raspadinha de Mirtilo
  121: 'https://i.imgur.com/Ju9e4bE.png', // Raspadinha de Morango
  122: 'https://i.imgur.com/Nqx4tnl.png', // Espetinho de Takoyaki
  123: 'https://i.imgur.com/7oHrfZb.png', // Caldo Forte
  124: 'https://i.imgur.com/1FvNkj2.png', // Chá Bobba Crepúsculo
  125: 'https://i.imgur.com/vdhIk6o.png', // Chá Bobba Verde
  126: 'https://i.imgur.com/SsYO5eh.png', // Chá Bobba Pink
  127: 'https://i.imgur.com/r6ZHbn4.png', // Sorvete de Casquinha
  128: 'https://i.imgur.com/jPjyRBZ.png', // Sorvete de Carvão
  129: 'https://i.imgur.com/EoRgLYY.png', // Iogurte
  130: 'https://i.imgur.com/oMn0esa.png', // Queijo
  131: 'https://i.imgur.com/WX5N0ch.png', // Pão
  132: 'https://i.imgur.com/Lxp0MNw.png', // Camarão
  133: 'https://i.imgur.com/zwK72Pd.png', // Brócolis
  134: 'https://i.imgur.com/Mopt9SD.png', // Melancia
  135: 'https://i.imgur.com/0ApPE7i.png', // Donut
  136: 'https://i.imgur.com/Vd8gwFP.png', // Linguiças
  137: 'https://i.imgur.com/Vd8gwFP.png', // Picolé
  138: 'https://i.imgur.com/0kTsS3u.png', // Saco de Salgadinhos Aberto
  139: 'https://i.imgur.com/cs6AmF0.png', // Boneco de Biscoito de Gengibre
  140: 'https://i.imgur.com/rNmvNaT.png', // Marreta
  141: 'https://i.imgur.com/XH41ETY.png', // Ovo de Páscoa Cintilante
  142: 'https://i.imgur.com/68mQXVk.png', // Bebida Glacial
  143: 'https://i.imgur.com/6bsmt5u.png', // Banana com Chocolate
  144: 'https://i.imgur.com/9q9fXzE.png', // Morango com Chocolate
  145: 'https://i.imgur.com/gO34eGD.png', // Frappuccino
  146: 'https://i.imgur.com/DOAmruo.png', // Café Barista
  147: 'https://i.imgur.com/HbBXdEx.png', // Garrafa de Fanta
  148: 'https://i.imgur.com/QDCzoJT.png', // Lupa
  149: 'https://i.imgur.com/3LTCxQc.png', // Café com Chantilly
  150: 'https://i.imgur.com/hvTONBL.png', // Dalgona com Estrela
  151: 'https://i.imgur.com/FqS9Qab.png', // Dalgona com Círculo
  152: 'https://i.imgur.com/rk9cz7e.png', // Dalgona com Quadrado
  153: 'https://i.imgur.com/AURe8uR.png', // Torrada Hello Kitty
  154: 'https://i.imgur.com/Gu12HUS.png', // Poção Kryptomon Rosa
  155: 'https://i.imgur.com/5gqY9E1.png', // Refrigerante Bear
  156: 'https://i.imgur.com/AOzPq0A.png', // Caveira de Doces Rosa
  157: 'https://i.imgur.com/8zO0WgQ.png', // handitem158
  158: 'https://i.imgur.com/8zO0WgQ.png', // handitem158
  159: 'https://i.imgur.com/pReevAV.png', // Suco de Pêra
  160: 'https://i.imgur.com/2BWnoA3.png', // handitem160
  161: 'https://i.imgur.com/VS7oBi4.png', // handitem161
  162: 'https://i.imgur.com/G1U31G2.png', // handitem162
  163: 'https://i.imgur.com/0V7AZLL.png', // Sorvete Arco-Íris
  165: 'https://i.imgur.com/S89htlF.png', // Palitinho de Marshmallow
  166: 'https://i.imgur.com/m5Gmc1b.png', // Cupcake
  167: 'https://i.imgur.com/I1mb8xq.png', // Sorvetinho de Baunilha
  168: 'https://i.imgur.com/VLS4wXW.png', // Batata
  169: 'https://i.imgur.com/eNSOAhz.png', // Coxinha
  170: 'https://i.imgur.com/zhBCfVQ.png', // Bolo Pato
  171: 'https://i.imgur.com/jE3xT86.png', // Bolo Pato
  172: 'https://i.imgur.com/nWz2OMW.png', // Milkshake de Banana
  173: 'https://i.imgur.com/gO34eGD.png', // Frappucino Banana Deluxe
  // ID 175 (Poison Mushroom / Cogumelo Venenoso) - será buscado automaticamente de múltiplas fontes
  244: 'https://i.imgur.com/EIaep5m.png', // Celular (já existe no mapeamento de CarryItems, mas vou adicionar aqui também)
  1455: 'https://i.imgur.com/gO34eGD.png', // Frappucino Banana Deluxe (Frappucino B)
  
  // CarryItems (crr) - para carregar
  1000: 'https://i.imgur.com/4gM6r6C.png', // Rosa
  1001: 'https://i.imgur.com/Zlu6ifO.png', // Rosa Negra
  1002: 'https://i.imgur.com/mQLKw3q.png', // Girassol
  1003: 'https://i.imgur.com/U2INTQY.png', // Livro Vermelho
  1004: 'https://i.imgur.com/fMJCUfp.png', // Livro Azul
  1005: 'https://i.imgur.com/MhMAMqQ.png', // Livro Verde
  1006: 'https://i.imgur.com/f8uG7pZ.png', // Flor de Presente
  1007: 'https://i.imgur.com/eXHHu6D.png', // Margarida Azul
  1008: 'https://i.imgur.com/ABbnvpD.png', // Margarida Amarela
  1009: 'https://i.imgur.com/RGPciQ6.png', // Margarida Rosa
  1011: 'https://i.imgur.com/kDLYfkl.png', // Prancheta
  1013: 'https://i.imgur.com/xuN1fLJ.png', // Comprimidos
  1014: 'https://i.imgur.com/u8R1Arz.png', // Seringa
  1015: 'https://i.imgur.com/YsCW8uV.png', // Bolsa de Resíduos Hospitalares
  1019: 'https://i.imgur.com/j3dHXD2.png', // Flor Bolly
  1021: 'https://i.imgur.com/SXgKTxX.png', // Jacinto Vermelho
  1022: 'https://i.imgur.com/2LnEO6a.png', // Jacinto Azul
  1023: 'https://i.imgur.com/bUo4kc0.png', // Poinsétia
  1024: 'https://i.imgur.com/A8TcY5X.png', // Panetone
  1025: 'https://i.imgur.com/UUxDAu9.png', // Bengala Doce
  1026: 'https://i.imgur.com/XbOEmiO.png', // Presente
  1027: 'https://i.imgur.com/6cTRrdL.png', // Vela Vermelha
  1028: 'https://i.imgur.com/cmsYdd4.png', // Tigela de Cereal
  1029: 'https://i.imgur.com/zcAjUIW.png', // Bexiga Bege
  1030: 'https://i.imgur.com/2bz2O5O.png', // HiPad
  1031: 'https://i.imgur.com/j36RF3O.png', // Tocha Habbolímpica
  1032: 'https://i.imgur.com/LnH1hO7.png', // Major Tom
  1033: 'https://i.imgur.com/HUOu7SX.png', // OVNI
  1034: 'https://i.imgur.com/0bm49KB.png', // Alienígena
  1035: 'https://i.imgur.com/DC9bwgO.png', // Osso
  1036: 'https://i.imgur.com/mzDcp8Q.png', // Pato de Borracha Viscoso
  1037: 'https://i.imgur.com/441jOt4.png', // Cobra
  1038: 'https://i.imgur.com/wSurn66.png', // Graveto
  1039: 'https://i.imgur.com/NFpQBxp.png', // Mão Decepada
  1040: 'https://i.imgur.com/KTvaGLH.png', // Coração Animal
  1041: 'https://i.imgur.com/cTQnLjz.png', // Lula
  1042: 'https://i.imgur.com/tOJdRTq.png', // Bat-Cocô
  1043: 'https://i.imgur.com/xDun8y8.png', // Verme
  1044: 'https://i.imgur.com/d2MSXaW.png', // Rato Morto
  1045: 'https://i.imgur.com/v7se7eU.png', // Dentadura
  1046: 'https://i.imgur.com/cVgXOXN.png', // Creme Clearasil
  1047: 'https://i.imgur.com/yMgBRfJ.png', // Pelouro
  1048: 'https://i.imgur.com/6D7nEX7.png', // Bandeira Ditch the Label Preta
  1049: 'https://i.imgur.com/rNmvNaT.png', // Marreta
  1050: 'https://i.imgur.com/XH41ETY.png', // Ovo de Páscoa
  1051: 'https://i.imgur.com/uGcEx03.png', // Pincel
  1052: 'https://i.imgur.com/CTp3zua.png', // Bandeira Ditch the Label Branca
  1053: 'https://i.imgur.com/3EL82RT.png', // Pato
  1054: 'https://i.imgur.com/cllQmtf.png', // Bexiga Laranja
  1055: 'https://i.imgur.com/o06TD0y.png', // Bexiga Verde
  1056: 'https://i.imgur.com/NTQgVKL.png', // Bexiga Azul
  1057: 'https://i.imgur.com/262gZxw.png', // Bexiga Rosa
  1058: 'https://i.imgur.com/DqBzgIQ.png', // Lampião
  1059: 'https://i.imgur.com/7OVjtWi.png', // Papel Higiênico
  1060: 'https://i.imgur.com/ZsA4yEF.png', // Tinta Spray
  1061: 'https://i.imgur.com/jCA08OY.png', // Cravo-de-tunes
  1062: 'https://i.imgur.com/AOzPq0A.png', // Caveira de Doces Rosa
  1063: 'https://i.imgur.com/pf0yYFz.png', // Caveira de Doces Verde
  1064: 'https://i.imgur.com/EkBdALa.png', // Caveira de Doces Azul
  1065: 'https://i.imgur.com/foeO33o.png', // Boneca Emília
  1066: 'https://i.imgur.com/2KYDnrl.png', // Ursinho
  1067: 'https://i.imgur.com/7M2EfPk.png', // Soldadinho
  1068: 'https://i.imgur.com/zLfpjYf.png', // Revista de Mangá
  1069: 'https://i.imgur.com/QBwlUUd.png', // Revista em Quadrinhos
  1070: 'https://i.imgur.com/nknKfKH.png', // Livro Amarelo
  1071: 'https://i.imgur.com/Fgcdsyn.png', // HiPad Dourado
  1072: 'https://i.imgur.com/EGiNJXo.png', // Bússola
  1073: 'https://i.imgur.com/T3u15aH.png', // Ovo Dino
  1074: 'https://i.imgur.com/UHrwe8a.png', // Alossauro Verde
  1075: 'https://i.imgur.com/lbNC1v2.png', // Tricerátopo Amarelo
  1076: 'https://i.imgur.com/WmCZiqq.png', // Saurolofo Roxo
  1077: 'https://i.imgur.com/7OVjtWi.png', // Toalha Spa Verde (green spa towel) - usando imagem de toalha/papel higiênico como referência
  1078: 'https://i.imgur.com/wtziU5n.png', // Espetinho de Lagartixa
  1079: 'https://i.imgur.com/se0ANSR.png', // Besouro Lucano
  1080: 'https://i.imgur.com/ZqwFSAi.png', // Besouro Rinoceronte
  1081: 'https://i.imgur.com/GtPaVOv.png', // Regador
  1082: 'https://i.imgur.com/AVLbjLD.png', // Bandeira do Orgulho
  1083: 'https://i.imgur.com/uumALYT.png', // Abóbora de Arrepiar
  1084: 'https://i.imgur.com/ZUUKd4L.png', // Sacola de Compras
  1085: 'https://i.imgur.com/2rncx7N.png', // DVD Ação
  1086: 'https://i.imgur.com/XzzGms4.png', // DVD Terror
  1087: 'https://i.imgur.com/6MYtIcr.png', // Caderno
  1088: 'https://i.imgur.com/6LMu0DK.png', // Lápis
  1089: 'https://i.imgur.com/82QgwIn.png', // Saco de Salgadinhos Lacrado
  1090: 'https://i.imgur.com/VtfRFvS.png', // Vara de Pescar com Peixe
  1091: 'https://i.imgur.com/65zXMEe.png', // Vara de Pescar com uma Bota Velha
  1092: 'https://i.imgur.com/r57dZf0.png', // Vara de Pescar com uma Mensagem na Garrafa
  1093: 'https://i.imgur.com/TbcOCsD.png', // Bandeira Ditch the Label Dourada
  1094: 'https://i.imgur.com/wZfJmho.png', // Espada
  1095: 'https://i.imgur.com/WB20uCW.png', // Coração
  1096: 'https://i.imgur.com/EIaep5m.png', // Celular
  1097: 'https://i.imgur.com/pXaI2XQ.png', // Vasinho com Muda
  1098: 'https://i.imgur.com/OT2dhUQ.png', // Robozinho
  1099: 'https://i.imgur.com/HfNo578.png', // Ursinho Teddy
  1100: 'https://i.imgur.com/9flhPhK.png', // Pato Férias
  1101: 'https://i.imgur.com/N0JwJIv.png', // Bola de Futebol
  1102: 'https://i.imgur.com/3ucrzut.png', // Taco do Diálogo
  1103: 'https://i.imgur.com/btLSfhl.png', // Bola de Tênis
  1104: 'https://i.imgur.com/Ey281Fk.png', // H-Phone
  1105: 'https://i.imgur.com/QuhGoIF.png', // Microfone DR Sports
  1106: 'https://i.imgur.com/ktQPb37.png', // football
  1107: 'https://i.imgur.com/12G8LSK.png', // Astral Bow
  1108: 'https://i.imgur.com/NJOQWy7.png', // Virvontavitsa
  1109: 'https://i.imgur.com/1utVe0S.png', // Saco com peixe
  1110: 'https://i.imgur.com/CVtIBQR.png', // Celular
  1111: 'https://i.imgur.com/XBk4Qjm.png', // Balão de pato
  1112: 'https://i.imgur.com/NZHO8RW.png', // Console
  1113: 'https://i.imgur.com/NVkfwgw.png', // Vela
  1114: 'https://i.imgur.com/KP0IAh0.png', // Coração verde
  1115: 'https://i.imgur.com/gmVMo2i.png', // Chocolate Quente
  1116: 'https://i.imgur.com/2JrZEqZ.png', // Pato Rosa
  1117: 'https://i.imgur.com/X91bzNn.png', // Faca
};
  
    // Usar imagem real se disponível
    if (realImages[handitem.id]) {
      return realImages[handitem.id];
    }
    
    // Para ID 175 (Poison Mushroom), usar mapeamento do XML
    if (handitem.id === 175) {
      // Carregar mapeamento assincronamente (será usado no onError se necessário)
      getReverseMappedValue(175).then(mapping => {
        if (mapping.crr === 1074) {
          console.log(`🔍 ID 175 mapeado para crr1074 no XML`);
        }
      }).catch(console.error);
      
      // Tentar URLs baseadas no mapeamento conhecido (1074)
      const possibleUrls = [
        '/handitems/images/preview/handitem1074.png',
        '/handitems/images/crr/crr1074.png',
        'https://images.habbo.com/gordon/flash-assets-PRODUCTION-202509092352-15493374/hh_human_item_crr1074.png',
      ];
      
      // Retornar primeira URL (o onError tentará as outras)
      return possibleUrls[0];
    }
    
    // Se não houver imagem no mapeamento, tentar outras fontes
    // 1. Tentar handitemImages.getHanditemImageById (que tenta REAL_IMAGES e local)
    try {
      const handitemImageUrl = handitemImages.getHanditemImageById(handitem.id);
      // Se retornou uma URL válida (não placeholder), usar
      if (handitemImageUrl && handitemImageUrl.startsWith('http')) {
        return handitemImageUrl;
      }
      // Se retornou uma URL local, também tentar
      if (handitemImageUrl && handitemImageUrl.startsWith('/')) {
        return handitemImageUrl;
      }
    } catch (error) {
      // Ignorar erro
    }
    
    // 2. Tentar imagens preview locais
    const previewImageUrl = `/handitems/images/preview/handitem_${handitem.id}.png`;
    // O onError do img tag vai lidar se não existir
    
    // 3. Tentar imagens extraídas
    const extractedImageUrl = `/handitems/images/extracted/handitem_${handitem.id}.svg`;
    
    // 4. Tentar imagem local genérica
    const localImageUrl = `/handitems/images/${handitem.id}.png`;
    
    // Retornar preview primeiro, depois extraída, depois local, depois placeholder
    // O onError vai tentar a próxima automaticamente
    return previewImageUrl;
  };

  // Verificar se um handitem pode ter ambas as ações (drk e crr)
  const canHaveBothActions = (handitemId: number): boolean => {
    // Itens com ID < 1000 são UseItems (drk) por padrão
    // Itens com ID >= 1000 são CarryItems (crr) por padrão
    // Mas alguns itens podem ter ambas as ações mapeadas no XML
    const hasDrkMapping = handitemActionMapper.hasMapping(handitemId, 'drk');
    const hasCrrMapping = handitemActionMapper.hasMapping(handitemId, 'crr');
    
    // Se tem mapeamento para ambas, pode alternar
    // Ou se é um UseItem (ID < 1000) que também tem mapeamento crr
    return (hasDrkMapping && hasCrrMapping) || (handitemId < 1000 && hasCrrMapping);
  };

  // Gerar URL do avatar com ação específica
  const generateAvatarUrlWithAction = (handitemId: number, actionType: 'drk' | 'crr'): string => {
    const habboName = habboAccount?.habbo_name || 'habbohub';
    const figureString = habboAccount?.figure_string;
    const gender = extractGenderFromFigureString(figureString);
    
    // Gerar URL base
    let avatarUrl = avatarPreview.generateAvatarUrl(habboName, handitemId, {
      size: 'l',
      hotel: 'com.br',
      figureString: figureString,
      gender: gender
    });
    
    // Substituir a ação na URL pela ação desejada
    const mappedValue = handitemActionMapper.getMappedValue(handitemId, actionType);
    if (avatarUrl.includes('action=std,drk=')) {
      avatarUrl = avatarUrl.replace(/action=std,drk=\d+/, `action=std,${actionType}=${mappedValue}`);
    } else if (avatarUrl.includes('action=std,crr=')) {
      avatarUrl = avatarUrl.replace(/action=std,crr=\d+/, `action=std,${actionType}=${mappedValue}`);
    } else if (avatarUrl.includes('action=std')) {
      avatarUrl = avatarUrl.replace('action=std', `action=std,${actionType}=${mappedValue}`);
    }
    
    return avatarUrl;
  };

  // Gerar URL do avatar com handitem
  const generateAvatarUrl = (handitemId: number): string => {
    const habboName = habboAccount?.habbo_name || 'habbohub';
    const figureString = habboAccount?.figure_string;
    const gender = extractGenderFromFigureString(figureString);
    
    return avatarPreview.generateAvatarUrl(habboName, handitemId, {
      size: 'l',
      hotel: 'com.br',
      figureString: figureString,
      gender: gender
    });
  };

  // Resolver imagem do handitem - usa a mesma função que já funciona no grid
  const resolveHanditemImage = (handitem: HabboHanditem): string => {
    return getHanditemImageUrl(handitem);
  };

  const copyHanditemId = async (handitem: HabboHanditem) => {const textToCopy = handitem.id.toString();
    
    try {
      // Verificar se navigator existe e tem clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {await navigator.clipboard.writeText(textToCopy);
      } else {// Fallback para navegadores mais antigos ou contextos não seguros
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('execCommand failed');
        }
      }toast({
        title: "ID copiado!",
        description: `${handitem.name} (ID: ${handitem.id}) copiado para a área de transferência`,
      });
    } catch (error) {
      console.error('❌ Erro ao copiar ID:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o ID. Tente selecionar e copiar manualmente: " + textToCopy,
        variant: "destructive",
      });
    }
  };

  // Obter cor do badge baseado no tipo
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'UseItem': return 'default';
      case 'CarryItem': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar handitems ou mobílias..."
                    value={externalSearchTerm ?? searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={!!externalSearchTerm}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={loadData} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button 
                  onClick={extractData} 
                  disabled={isExtracting}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Zap className={`h-4 w-4 ${isExtracting ? 'animate-pulse' : ''}`} />
                  {isExtracting ? 'Extraindo...' : 'Extrair do Servidor'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="w-full space-y-4">
        {!hideHeader && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(HANDITEM_CATEGORIES).map(([key, category]) => {
              const categoryImageUrl = getCategoryHanditemImage(key);
              
              // Componente interno para o botão de categoria com estado de erro de imagem
              const CategoryButton: React.FC = () => {
                const [imageError, setImageError] = useState(false);
                
                return (
                  <Button
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="flex items-center gap-2"
                  >
                    {categoryImageUrl && !imageError ? (
                      <img 
                        src={categoryImageUrl} 
                        alt={category.label}
                        className="w-4 h-4 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={() => {
                          setImageError(true);
                        }}
                      />
                    ) : (
                      <category.icon className="h-4 w-4" />
                    )}
                    {category.label}
                  </Button>
                );
              };
              
              return <CategoryButton key={key} />;
            })}
          </div>
        )}

        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-500">Carregando handitems...</p>
              </div>
            </div>
          ) : (
            <div ref={handitemsContainerRef} className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 auto-rows-min">
              {filteredHanditems.map((handitem) => {
                const isCopied = copiedHanditems.has(handitem.id);
                const canAlternate = canHaveBothActions(handitem.id);
                
                // Componente interno para animação alternada
                const AnimatedAvatarPreview: React.FC<{ handitemId: number; canAlternate: boolean }> = ({ handitemId, canAlternate }) => {
                  const [currentAction, setCurrentAction] = useState<'drk' | 'crr'>(handitemId >= 1000 ? 'crr' : 'drk');
                  const intervalRef = useRef<NodeJS.Timeout | null>(null);
                  const imgRef = useRef<HTMLImageElement>(null);
                  
                  // URL inicial
                  const initialUrl = useMemo(() => {
                    return canAlternate 
                      ? generateAvatarUrlWithAction(handitemId, currentAction)
                      : generateAvatarUrl(handitemId);
                  }, [handitemId, canAlternate]);
                  
                  // Atualizar src da imagem quando a ação mudar, sem causar re-render
                  useEffect(() => {
                    if (canAlternate && imgRef.current) {
                      const newUrl = generateAvatarUrlWithAction(handitemId, currentAction);
                      // Atualizar src diretamente sem causar re-render do componente pai
                      imgRef.current.src = `${newUrl}${newUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
                    }
                  }, [currentAction, canAlternate, handitemId]);
                  
                  useEffect(() => {
                    if (canAlternate) {
                      // Alternar entre drk e crr a cada 2 segundos
                      intervalRef.current = setInterval(() => {
                        setCurrentAction(prev => prev === 'drk' ? 'crr' : 'drk');
                      }, 2000);
                    }
                    
                    return () => {
                      if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                      }
                    };
                  }, [canAlternate]);
                  
                  return (
                    <img
                      ref={imgRef}
                      key={`handitem-popover-${handitemId}`}
                      src={`${initialUrl}${initialUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`}
                      alt="Avatar com handitem"
                      className="w-auto h-auto max-w-none object-scale-down"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        console.error(`❌ Erro ao carregar avatar com handitem:`, {
                          handitemId: handitemId,
                          currentAction,
                          url: target.src
                        });
                        const fallbackHabboName = habboAccount?.habbo_name || 'habbohub';
                        const fallbackFigureString = habboAccount?.figure_string;
                        const fallbackGender = extractGenderFromFigureString(fallbackFigureString);
                        const fallbackUrl = avatarPreview.generateAvatarUrl(fallbackHabboName, handitemId, {
                          size: 'l',
                          hotel: 'com.br',
                          figureString: fallbackFigureString,
                          gender: fallbackGender
                        });
                        target.src = `${fallbackUrl}${fallbackUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
                      }}
                    />
                  );
                };
                
                const isExpanded = expandedHanditemId === handitem.id;
                
                return (
                  <Card 
                    key={`${handitem.assetPrefix}-${handitem.id}`}
                    data-handitem-id={handitem.id}
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 group flex flex-col h-full touch-manipulation ${
                      isExpanded ? 'col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5' : 'hover:scale-105'
                    }`}
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedHanditemId(null);
                      } else {
                        setExpandedHanditemId(handitem.id);
                        // Copiar o ID quando expandir
                        copyHanditemId(handitem);
                        if (onHanditemSelect) {
                          onHanditemSelect(handitem);
                        }
                      }
                    }}
                    title="Clique para expandir e ver no avatar"
                  >
                    <CardContent className={`p-2 flex flex-col h-full ${isExpanded ? 'p-4' : ''}`}>
                      {!isExpanded ? (
                        // Vista compacta (original)
                        <div className="flex flex-col items-center justify-between h-full gap-1.5 relative">
                          {/* Badge "Novo" para os 5 mais recentes */}
                          {handitem.isNew && (
                            <div className="absolute -top-1 -right-1 z-10">
                              <img 
                                src="/assets/new.png" 
                                alt="Novo" 
                                className="w-auto h-auto max-w-5 max-h-5 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Imagem centralizada no topo */}
                          <div className="flex items-center justify-center relative flex-shrink-0">
                            <img 
                              src={getHanditemImageUrl(handitem)} 
                              alt={handitem.name}
                              className="max-w-10 max-h-10 object-contain"
                              onError={async (e) => {
                                const target = e.currentTarget;
                                const currentSrc = target.src;
                                
                                // Lógica especial para ID 175 (Poison Mushroom) - usar mapeamento do XML
                                if (handitem.id === 175) {
                                  const mapping = await getReverseMappedValue(175);
                                  if (mapping.crr === 1074) {
                                    // Tentar URLs baseadas no valor mapeado 1074
                                    const fallbackUrls = [
                                      '/handitems/images/crr/crr1074.png',
                                      'https://images.habbo.com/gordon/flash-assets-PRODUCTION-202509092352-15493374/hh_human_item_crr1074.png',
                                      '/handitems/images/preview/handitem1074.png',
                                      handitemImages.getHanditemImageById(1074), // Se existir mapeamento para 1074
                                    ];
                                    
                                    // Tentar cada URL até encontrar uma que funcione
                                    for (const url of fallbackUrls) {
                                      if (url && url !== currentSrc && !url.includes('placeholder')) {
                                        try {
                                          const testImg = new Image();
                                          testImg.onload = () => {
                                            target.src = url;
                                          };
                                          testImg.onerror = () => {
                                            // Continuar para próxima URL
                                          };
                                          testImg.src = url;
                                          // Se chegou aqui, a URL foi definida, aguardar resultado
                                          await new Promise(resolve => setTimeout(resolve, 100));
                                          if (target.src === url) return; // Se mudou, sucesso
                                        } catch (error) {
                                          // Continuar para próxima URL
                                        }
                                      }
                                    }
                                  }
                                }
                                
                                // Tentar outras fontes em ordem
                                if (currentSrc.includes('preview/handitem_')) {
                                  // Se preview falhou, tentar extraída
                                  target.src = `/handitems/images/extracted/handitem_${handitem.id}.svg`;
                                } else if (currentSrc.includes('extracted/handitem_')) {
                                  // Se extraída falhou, tentar local genérica
                                  target.src = `/handitems/images/${handitem.id}.png`;
                                } else if (currentSrc.includes(`/handitems/images/${handitem.id}.png`)) {
                                  // Se local falhou, tentar handitemImages
                                  try {
                                    const fallbackUrl = handitemImages.getHanditemImageById(handitem.id);
                                    if (fallbackUrl && fallbackUrl !== currentSrc && !fallbackUrl.includes('placeholder')) {
                                      target.src = fallbackUrl;
                                      return;
                                    }
                                  } catch (error) {
                                    // Ignorar
                                  }
                                  // Se tudo falhou, usar placeholder
                                  target.src = '/assets/handitem_placeholder.png';
                                } else if (!currentSrc.includes('handitem_placeholder') && !currentSrc.includes('placeholder.svg')) {
                                  // Última tentativa: placeholder
                                  target.src = '/assets/handitem_placeholder.png';
                                } else {
                                  // Se o placeholder também falhar, esconde a imagem e mostra o ícone
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }
                              }}
                            />
                            <ImageIcon className="h-5 w-5 text-gray-400 hidden" />
                          </div>
                          
                          {/* Nome do item - 2 linhas fixas */}
                          <div className="text-center w-full flex-1 flex flex-col justify-center min-h-[2rem] px-1">
                            <h3 className="font-medium text-xs leading-tight break-words" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textAlign: 'center'
                            }}>
                              {handitem.name}
                            </h3>
                          </div>
                          
                          {/* ID alinhado no centro inferior */}
                          <div className="flex items-center justify-center gap-1 w-full flex-shrink-0 mt-auto">
                            <span className="text-xs text-gray-500 text-center">
                              ID: {handitem.id}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyHanditemId(handitem);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Vista expandida (com avatar preview)
                        <div className="relative flex flex-col items-center space-y-4 w-full">
                          {/* Badge "Novo" para os 5 mais recentes */}
                          {handitem.isNew && (
                            <div className="absolute -top-1 -right-1 z-10">
                              <img 
                                src="/assets/new.png" 
                                alt="Novo" 
                                className="w-auto h-auto max-w-5 max-h-5 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Avatar Preview com animação alternada */}
                          <div className="relative flex items-center justify-center bg-muted rounded-lg border border-border p-4 w-full">
                            <AnimatedAvatarPreview handitemId={handitem.id} canAlternate={canAlternate} />
                            {/* Botão de Copiar ID sobreposto */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                copyHanditemId(handitem);
                                setCopiedHanditems(prev => new Set(prev).add(handitem.id));
                                setTimeout(() => {
                                  setCopiedHanditems(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(handitem.id);
                                    return newSet;
                                  });
                                }, 2000);
                              }}
                              type="button"
                              className="absolute top-2 right-2 bg-background/90 hover:bg-background rounded-md p-1.5 transition-all duration-300 flex items-center justify-end gap-1.5 shadow-md border-0 outline-none overflow-hidden"
                              style={{ 
                                border: 'none',
                                width: isCopied ? 'auto' : '2rem',
                                minWidth: '2rem'
                              }}
                              title="Copiar ID"
                            >
                              <Copy className="w-4 h-4 flex-shrink-0" style={{ stroke: 'currentColor' }} />
                              {isCopied && (
                                <span className="volter-font text-xs whitespace-nowrap animate-in fade-in slide-in-from-right-2">
                                  ID Copiado
                                </span>
                              )}
                            </button>
                          </div>
                          
                          {/* Informações do Handitem */}
                          <div className="text-center space-y-2 w-full">
                            <div className="flex items-center justify-center gap-2">
                              <img
                                src={resolveHanditemImage(handitem)}
                                alt={handitem.name}
                                className="max-w-8 max-h-8 w-auto h-auto object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (target.src !== '/assets/handitem_placeholder.png') {
                                    target.src = '/assets/handitem_placeholder.png';
                                  }
                                }}
                              />
                              <span className="volter-font font-bold text-base">{handitem.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ID: {handitem.id}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

