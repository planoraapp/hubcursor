
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface UserSearchProps {
  onUserFound?: (user: any) => void;
  onUserNotFound?: () => void;
  onSearch?: (username: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export const UserSearch: React.FC<UserSearchProps> = ({ 
  onUserFound,
  onUserNotFound,
  onSearch, 
  isLoading = false, 
  placeholder = "Digite o nome do usuário Habbo...",
  className = "" 
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (onSearch) {
        onSearch(searchInput.trim());
      }
      if (onUserFound) {
        // Simulate user search - in real implementation this would query the API
        onUserFound({ name: searchInput.trim() });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white w-3 h-3" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-8 bg-transparent border-white text-white placeholder-white/60 h-6 text-sm"
          disabled={isLoading}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!searchInput.trim() || isLoading}
        className="px-3 py-1 h-6 bg-transparent border border-white text-white hover:bg-white/10"
        size="sm"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Search className="w-3 h-3" />
        )}
      </Button>
    </form>
  );
};
