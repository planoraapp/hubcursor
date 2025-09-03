import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface HanditemSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const HanditemSearch: React.FC<HanditemSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Buscar mobi ou item de mão..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 volter-font"
      />
    </div>
  );
};