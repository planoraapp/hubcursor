
import { useState } from 'react';
import { optimizedFeedService } from '@/services/optimizedFeedService';

export const useUserSearch = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUser = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    // Só busca se tiver pelo menos 2 caracteres
    if (query.trim().length < 2) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log(`🔍 [useUserSearch] Searching for: "${query}"`);
      
      const results = await optimizedFeedService.searchUsers(query);
      
      if (results && results.users) {
        setSearchResults(results.users);
        console.log(`✅ [useUserSearch] Found ${results.users.length} users`);
      } else {
        setSearchResults([]);
        console.log(`⚠️ [useUserSearch] No results returned for "${query}"`);
      }
    } catch (err) {
      console.error('❌ [useUserSearch] Search error:', err);
      setError('Erro na busca. Tente novamente em alguns segundos.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchResults,
    isSearching,
    error,
    searchUser
  };
};
