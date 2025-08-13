import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface UserSearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({ 
  onSearch, 
  isLoading = false, 
  placeholder = "Buscar usuários por nome..." 
}) => {
  const [searchInput, setSearchInput] = useState('');

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, onSearch]);

  const handleClear = () => {
    setSearchInput('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
        disabled={isLoading}
      />
      {searchInput && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};