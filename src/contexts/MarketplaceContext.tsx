
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface MarketItem {
  id: string;
  name: string;
  className: string;
  currentPrice: number;
  previousPrice?: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: string;
  volume: number;
  openOffers?: number;
  quantity?: number;
  soldItems?: number;
  rarity: string; // Changed from union to string to match actual usage
  category: string;
  imageUrl: string;
  lastUpdated: string;
  description?: string;
  hotel?: string;
  priceHistory?: number[];
  listedAt?: string;
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
  apiStatus: 'success' | 'error' | 'partial' | 'no-data' | 'unavailable'; // Added 'unavailable'
  apiMessage?: string;
}

export interface ClubItem {
  id: string;
  name: string;
  price: number;
  available: boolean | number; // Allow both boolean and number
  type: 'hc' | 'ca';
  imageUrl: string;
  className: string;
}

interface MarketplaceState {
  items: MarketItem[];
  stats: MarketStats;
  loading: boolean;
  error: string | null;
  selectedHotel: string;
  searchTerm: string;
  selectedCategory: string;
  sortBy: 'price' | 'recent' | 'quantity' | 'ltd';
}

interface MarketplaceContextType {
  items: MarketItem[];
  setItems: (items: MarketItem[]) => void;
  state: MarketplaceState;
  setHotel: (hotel: string) => void;
  setSearch: (term: string) => void;
  setCategory: (category: string) => void;
  setSort: (sort: 'price' | 'recent' | 'quantity' | 'ltd') => void;
  getFilteredItems: (type: 'topSellers' | 'biggestGainers' | 'opportunities' | 'todayHigh') => MarketItem[];
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    totalItems: 0,
    averagePrice: 0,
    totalVolume: 0,
    trendingUp: 0,
    trendingDown: 0,
    featuredItems: 0,
    highestPrice: 0,
    mostTraded: 'N/A',
    apiStatus: 'no-data'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState('br');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'price' | 'recent' | 'quantity' | 'ltd'>('price');

  const state: MarketplaceState = {
    items,
    stats,
    loading,
    error,
    selectedHotel,
    searchTerm,
    selectedCategory,
    sortBy
  };

  const setHotel = useCallback((hotel: string) => {
    setSelectedHotel(hotel);
  }, []);

  const setSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const setCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const setSort = useCallback((sort: 'price' | 'recent' | 'quantity' | 'ltd') => {
    setSortBy(sort);
  }, []);

  const getFilteredItems = useCallback((type: 'topSellers' | 'biggestGainers' | 'opportunities' | 'todayHigh') => {
    switch (type) {
      case 'topSellers':
        return [...items]
          .filter(item => item.volume > 0)
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 10);
      
      case 'biggestGainers':
        return [...items]
          .filter(item => item.trend === 'up' && parseFloat(item.changePercent) > 0)
          .sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent))
          .slice(0, 10);
      
      case 'opportunities':
        return [...items]
          .filter(item => 
            (item.rarity === 'legendary' || item.rarity === 'rare') && 
            item.currentPrice > 50
          )
          .sort((a, b) => b.currentPrice - a.currentPrice)
          .slice(0, 10);
      
      case 'todayHigh':
        return [...items]
          .filter(item => (item.soldItems || 0) > 0)
          .sort((a, b) => b.currentPrice - a.currentPrice)
          .slice(0, 10);
      
      default:
        return [];
    }
  }, [items]);

  return (
    <MarketplaceContext.Provider value={{
      items,
      setItems,
      state,
      setHotel,
      setSearch,
      setCategory,
      setSort,
      getFilteredItems
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = (): MarketplaceContextType => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
