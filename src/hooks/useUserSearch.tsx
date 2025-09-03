
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

    if (query.trim().length < 2) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log(`🔍 [useUserSearch] Searching for: "${query}"`);
      
      // Usar edge function de busca de usuários
      const { data, error } = await supabase.functions.invoke('habbo-user-search', {
        body: { 
          query: query.trim(),
          hotel: 'br',
          limit: 15 
        }
      });

      if (error) {
        console.error('❌ [useUserSearch] Edge function error:', error);
        setError('Erro na busca. Tente novamente.');
        setSearchResults([]);
        return;
      }

      const users = data?.users || [];
      setSearchResults(users);
      console.log(`✅ [useUserSearch] Found ${users.length} users for "${query}"`);

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
