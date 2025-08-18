
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

    // Busca com apenas 1 caractere para melhor UX
    if (query.trim().length < 1) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log(`🔍 [useUserSearch] Searching for: "${query}"`);
      
      // Tentar busca otimizada primeiro
      const results = await optimizedFeedService.searchUsers(query);
      
      if (results && results.users && results.users.length > 0) {
        setSearchResults(results.users);
        console.log(`✅ [useUserSearch] Found ${results.users.length} users`);
      } else {
        // Se não encontrar, tentar busca mais ampla
        console.log(`🔄 [useUserSearch] Trying broader search for "${query}"`);
        
        // Buscar variações do nome
        const variations = [
          query,
          query.toLowerCase(),
          query.charAt(0).toUpperCase() + query.slice(1).toLowerCase(),
          query.toUpperCase()
        ];

        let allResults: any[] = [];
        
        for (const variation of variations) {
          try {
            const varResults = await optimizedFeedService.searchUsers(variation);
            if (varResults && varResults.users) {
              allResults = [...allResults, ...varResults.users];
            }
          } catch (err) {
            console.log(`⚠️ [useUserSearch] Variation "${variation}" failed:`, err);
          }
        }

        // Remover duplicatas baseado no habbo_name
        const uniqueResults = allResults.filter((user, index, self) => 
          index === self.findIndex(u => u.habbo_name === user.habbo_name)
        );

        setSearchResults(uniqueResults);
        console.log(`✅ [useUserSearch] Found ${uniqueResults.length} unique users after variations`);
      }
    } catch (err) {
      console.error('❌ [useUserSearch] Search error:', err);
      setError('Erro na busca. Tente novamente.');
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
