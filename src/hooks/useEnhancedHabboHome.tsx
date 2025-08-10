import { useState } from 'react';

export const useEnhancedHabboHome = () => {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    setLoading,
    // Add other mock functions as needed
  };
};
