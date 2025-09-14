
import { useState } from 'react';
import { useUnifiedUserSearch } from './useUnifiedAPI';

export const useUserSearch = () => {
  const [query, setQuery] = useState<string>('');
  
  const { 
    data: searchResults = [], 
    loading: isSearching, 
    error, 
    fetchData: searchUser 
  } = useUnifiedUserSearch({
    query,
    hotel: 'br',
    limit: 15,
    enabled: false // Don't auto-fetch
  });

  const searchUserQuery = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setQuery('');
      return;
    }

    if (searchQuery.trim().length < 2) {
      setQuery('');
      return;
    }

    setQuery(searchQuery.trim());

    try {
            await searchUser({
        query: searchQuery.trim(),
        hotel: 'br',
        limit: 15
      });

          } catch (err) {
          }
  };

  return {
    searchResults,
    isSearching,
    error: error || null,
    searchUser: searchUserQuery
  };
};
