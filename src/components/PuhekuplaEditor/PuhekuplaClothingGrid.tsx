
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shirt, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePuhekuplaClothing } from '@/hooks/usePuhekuplaData';
import type { PuhekuplaClothing } from '@/hooks/usePuhekuplaData';

interface PuhekuplaClothingGridProps {
  searchTerm: string;
  selectedCategory: string;
  onItemSelect: (item: PuhekuplaClothing) => void;
}

const PuhekuplaClothingGrid: React.FC<PuhekuplaClothingGridProps> = ({
  searchTerm,
  selectedCategory,
  onItemSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = usePuhekuplaClothing(currentPage, selectedCategory, searchTerm);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-800 mb-2">Carregando Roupas</h3>
          <p className="text-purple-600">Buscando items na Puhekupla...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <Shirt className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Roupas</h3>
        <p className="text-sm text-red-600 mb-4">
          Não foi possível conectar com a API Puhekupla
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-600">
          Recarregar Página
        </Button>
      </div>
    );
  }

  const clothingList = data?.result?.clothing || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <Shirt className="w-6 h-6" />
            Catálogo de Roupas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm text-purple-700">
            <span>Total de itens: <strong>{pagination?.total || 0}</strong></span>
            <span>Página {currentPage} de {totalPages}</span>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {clothingList.map((item: PuhekuplaClothing) => (
          <Card 
            key={item.guid}
            className="group hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400"
            onClick={() => onItemSelect(item)}
          >
            <CardContent className="p-3 text-center">
              {/* Item Image */}
              <div className="relative mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 mx-auto object-contain rounded-lg bg-gray-50 p-1"
                  style={{ imageRendering: 'pixelated' }}
                  loading="lazy"
                />
                
                {/* Gender Badge */}
                {item.gender && item.gender !== 'U' && (
                  <Badge className={`absolute -top-1 -right-1 text-white text-xs ${
                    item.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}>
                    {item.gender === 'M' ? '👨' : '👩'}
                  </Badge>
                )}
              </div>
              
              {/* Item Info */}
              <div className="space-y-1">
                <h4 className="font-medium text-xs text-gray-800 leading-tight line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {item.category}
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-lg transition-colors duration-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {clothingList.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Shirt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma roupa encontrada</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou busca</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? "bg-purple-600" : ""}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PuhekuplaClothingGrid;
