import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { getHotelFlag } from '@/utils/hotelHelpers';
import { searchUsersGlobally } from '@/utils/userSearch';

interface UserSearchProps {
  onUserSelect: (username: string, hotelDomain: string, uniqueId?: string) => void;
  placeholder?: string;
  className?: string;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelect,
  placeholder = 'Buscar usuário...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchTerm('');
      }
    };

    const shouldShowDropdown = searchResults.length > 0 || (searchTerm.trim().length > 0 && !isSearching);
    if (shouldShowDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchResults.length, searchTerm, isSearching]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsersGlobally(searchTerm.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching user:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: any) => {
    const hotelDomain = user.hotelDomain || 'com.br';
    onUserSelect(user.name, hotelDomain, user.uniqueId);
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className={`relative flex-1 ${className}`} style={{ zIndex: 100 }} ref={searchDropdownRef}>
      {/* Dropdown de resultados */}
      {((searchResults.length > 0) || (searchTerm.trim().length > 0 && !isSearching && searchResults.length === 0)) && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-white/20 rounded shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" 
             style={{ maxHeight: '224px', backgroundColor: '#3a3a3a', zIndex: 1000 }}>
          {searchResults.length > 0 ? (
            searchResults.map((user, index) => {
              const hotelDomain = user.hotelDomain || 'com.br';
              const hotelCode = user.hotelCode || (hotelDomain === 'com.br' ? 'br' : hotelDomain === 'com.tr' ? 'tr' : hotelDomain);
              const figureString = user.figureString || '';
              const avatarUrl = figureString 
                ? `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&size=m&head_direction=3&headonly=1`
                : `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(user.name)}&size=m&head_direction=3&headonly=1`;

              return (
                <div
                  key={`${user.uniqueId}-${index}`}
                  className="flex items-center gap-3 p-2 bg-transparent hover:bg-white/5 border-b border-white/10 last:border-b-0 transition-colors cursor-pointer"
                  onClick={() => handleUserSelect(user)}
                >
                  <img
                    src={getHotelFlag(hotelCode)}
                    alt={hotelCode}
                    className="w-6 h-6 object-contain flex-shrink-0"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="w-[52px] h-[52px] flex-shrink-0 overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(user.name)}&size=m&head_direction=3&headonly=1`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{user.name}</div>
                    <div className="text-xs text-white/60 truncate">{user.motto || ''}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center gap-3 p-4 bg-transparent">
              <div className="text-white/60 text-sm">Nenhum resultado encontrado</div>
            </div>
          )}
        </div>
      )}

      {/* Campo de busca */}
      <div className="flex items-center bg-white/10 border border-white/30 rounded focus-within:border-white/70 transition-colors h-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white text-sm px-3 py-1 placeholder-white/50 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-2 py-1 text-white/80 hover:text-white disabled:text-white/40 transition-colors flex items-center justify-center h-full flex-shrink-0"
          title="Buscar"
          style={{ minWidth: '32px' }}
        >
          {isSearching ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <img 
              src="/assets/console/search.png" 
              alt="Buscar" 
              className="w-5 h-5"
              style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
            />
          )}
        </button>
      </div>
    </div>
  );
};

