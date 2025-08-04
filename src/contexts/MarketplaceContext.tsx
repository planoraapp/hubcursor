import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { HabboAPIService } from '@/services/HabboAPIService';

export interface MarketItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  previousPrice?: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  volume: number;
  imageUrl: string;
  rarity: string;
  description: string;
  className: string;
  hotel: string;
  priceHistory: number[];
  lastUpdated: string;
  quantity?: number;
  listedAt?: string;
  soldItems?: number;
  openOffers?: number;
  isFeatured?: boolean;
}

export interface MarketStats {
  totalItems: number;
  averagePrice: number;
  totalVolume: number;
  trendingUp: number;
  trendingDown: number;
  featuredItems: number;
  highestPrice: number;
  mostTraded: string;
  apiStatus?: 'success' | 'partial' | 'no-data' | 'error' | 'unavailable';
  apiMessage?: string;
}

export interface ClubItem {
  id: string;
  name: string;
  price: number;
  className: string;
  type: 'hc' | 'ca';
  imageUrl: string;
  available: boolean;
}

interface MarketplaceState {
  items: MarketItem[];
  clubItems: ClubItem[];
  stats: MarketStats;
  loading: boolean;
  error: string | null;
  selectedHotel: string;
  searchTerm: string;
  selectedCategory: string;
  sortBy: 'price' | 'recent' | 'quantity' | 'ltd';
}

type MarketplaceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: MarketItem[] }
  | { type: 'SET_CLUB_ITEMS'; payload: ClubItem[] }
  | { type: 'SET_STATS'; payload: MarketStats }
  | { type: 'SET_HOTEL'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_SORT'; payload: 'price' | 'recent' | 'quantity' | 'ltd' };

const initialState: MarketplaceState = {
  items: [],
  clubItems: [],
  stats: {
    totalItems: 0,
    averagePrice: 0,
    totalVolume: 0,
    trendingUp: 0,
    trendingDown: 0,
    featuredItems: 0,
    highestPrice: 0,
    mostTraded: 'N/A',
    apiStatus: 'no-data',
    apiMessage: 'Aguardando dados da HabboAPI.site...'
  },
  loading: true,
  error: null,
  selectedHotel: 'com',
  searchTerm: '',
  selectedCategory: 'all',
  sortBy: 'price'
};

function marketplaceReducer(state: MarketplaceState, action: MarketplaceAction): MarketplaceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SET_CLUB_ITEMS':
      return { ...state, clubItems: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_HOTEL':
      return { ...state, selectedHotel: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    default:
      return state;
  }
}

interface MarketplaceContextType {
  state: MarketplaceState;
  fetchMarketData: () => Promise<void>;
  fetchClubItems: () => Promise<void>;
  setHotel: (hotel: string) => void;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setSort: (sort: 'price' | 'recent' | 'quantity' | 'ltd') => void;
  getFilteredItems: (type: 'topSellers' | 'biggestGainers' | 'opportunities' | 'todayHigh') => MarketItem[];
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

interface MarketplaceProviderProps {
  children: ReactNode;
}

export const MarketplaceProvider = ({ children }: MarketplaceProviderProps) => {
  const [state, dispatch] = useReducer(marketplaceReducer, initialState);

  const fetchMarketData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log('🔄 [Context] Buscando dados da HabboAPI.site...');
      
      const data = await HabboAPIService.fetchMarketData({
        searchTerm: state.searchTerm,
        category: state.selectedCategory === 'all' ? '' : state.selectedCategory,
        hotel: state.selectedHotel,
        days: 30
      });
      
      if (data) {
        const sortedItems = HabboAPIService.sortItems(data.items, state.sortBy);
        dispatch({ type: 'SET_ITEMS', payload: sortedItems });
        dispatch({ type: 'SET_STATS', payload: data.stats });
        
        console.log(`✅ [Context] Carregados ${sortedItems.length} itens da HabboAPI.site`);
        
        // Tratar diferentes estados da API
        if (data.stats.apiStatus === 'error') {
          dispatch({ type: 'SET_ERROR', payload: data.stats.apiMessage || 'Erro na HabboAPI.site' });
        } else if (data.stats.apiStatus === 'no-data' && sortedItems.length === 0) {
          dispatch({ type: 'SET_ERROR', payload: 'Nenhum dado disponível para os filtros selecionados' });
        }
      } else {
        dispatch({ type: 'SET_ITEMS', payload: [] });
        dispatch({ type: 'SET_STATS', payload: {
          ...initialState.stats,
          apiStatus: 'error',
          apiMessage: 'Falha na conexão com HabboAPI.site'
        }});
        dispatch({ type: 'SET_ERROR', payload: 'Não foi possível conectar à HabboAPI.site' });
      }
    } catch (error: any) {
      console.error('❌ [Context] Erro:', error);
      dispatch({ type: 'SET_ERROR', payload: `Erro interno: ${error.message}` });
      dispatch({ type: 'SET_ITEMS', payload: [] });
      dispatch({ type: 'SET_STATS', payload: {
        ...initialState.stats,
        apiStatus: 'error',
        apiMessage: 'Erro interno do sistema'
      }});
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchClubItems = async () => {
    try {
      // Simulação de dados do clube (não precisam da API)
      const clubItems: ClubItem[] = [
        {
          id: 'hc_31_days',
          name: '31 Dias HC',
          price: 25000,
          className: 'hc31',
          type: 'hc',
          imageUrl: '/assets/hc31.png',
          available: true
        },
        {
          id: 'ca_31_days', 
          name: '31 Dias CA',
          price: 30000,
          className: 'ca31',
          type: 'ca',
          imageUrl: '/assets/bc31.png',
          available: true
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch({ type: 'SET_CLUB_ITEMS', payload: clubItems });
    } catch (error: any) {
      console.error('Erro ao buscar itens de clube:', error);
    }
  };

  const setHotel = (hotel: string) => {
    dispatch({ type: 'SET_HOTEL', payload: hotel });
  };

  const setSearch = (search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  };

  const setCategory = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setSort = (sort: 'price' | 'recent' | 'quantity' | 'ltd') => {
    dispatch({ type: 'SET_SORT', payload: sort });
  };

  const getFilteredItems = (type: 'topSellers' | 'biggestGainers' | 'opportunities' | 'todayHigh'): MarketItem[] => {
    return HabboAPIService.getFilteredItems(state.items, type);
  };

  // Auto-fetch quando filtros mudam
  useEffect(() => {
    fetchMarketData();
  }, [state.selectedHotel, state.searchTerm, state.selectedCategory, state.sortBy]);

  // Auto-fetch club items quando hotel muda
  useEffect(() => {
    fetchClubItems();
  }, [state.selectedHotel]);

  // Auto-refresh a cada 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.loading) {
        fetchMarketData();
        fetchClubItems();
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.loading]);

  const value: MarketplaceContextType = {
    state,
    fetchMarketData,
    fetchClubItems,
    setHotel,
    setSearch,
    setCategory,
    setSort,
    getFilteredItems
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};
