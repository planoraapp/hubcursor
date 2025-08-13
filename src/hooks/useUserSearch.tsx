import { useState } from 'react';
import { optimizedFeedService } from '@/services/optimizedFeedService';

export const useUserSearch = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUser = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log(`🔍 [useUserSearch] Searching for: "${query}"`);
      
      const results = await optimizedFeedService.searchUsers(query);
      setSearchResults(results.users || []);
      
      console.log(`✅ [useUserSearch] Found ${results.users?.length || 0} users`);
    } catch (err) {
      console.error('❌ [useUserSearch] Search error:', err);
      setError('Erro na busca de usuários');
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