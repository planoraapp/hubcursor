
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MarketplaceContextType {
  items: any[];
  setItems: (items: any[]) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<any[]>([]);

  return (
    <MarketplaceContext.Provider value={{ items, setItems }}>
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
