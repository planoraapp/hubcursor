
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePuhekuplaBadges } from '@/hooks/usePuhekuplaData';
import type { PuhekuplaBadge } from '@/hooks/usePuhekuplaData';

interface PuhekuplaBadgesGridProps {
  searchTerm: string;
  onItemSelect: (item: PuhekuplaBadge) => void;
}

const PuhekuplaBadgesGrid: React.FC<PuhekuplaBadgesGridProps> = ({
  searchTerm,
  onItemSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = usePuhekuplaBadges(currentPage, searchTerm);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-yellow-800 mb-2">Carregando Emblemas</h3>
          <p className="text-yellow-600">Buscando badges na Puhekupla...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <Award className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar Emblemas</h3>
        <p className="text-sm text-red-600 mb-4">
          Não foi possível conectar com a API Puhekupla
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-600">
          Recarregar Página
        </Button>
      </div>
    );
  }

  const badgesList = data?.result?.badges || [];
  const pagination = data?.result?.pagination || data?.pagination;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <Award className="w-6 h-6" />
            Catálogo de Emblemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm text-yellow-700">
            <span>Total de itens: <strong>{pagination?.total || 0}</strong></span>
            <span>Página {currentPage} de {totalPages}</span>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
        {badgesList.map((item: PuhekuplaBadge) => (
          <Card 
            key={item.guid}
            className="group hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-yellow-200 hover:border-yellow-400"
            onClick={() => onItemSelect(item)}
          >
            <CardContent className="p-3 text-center">
              {/* Badge Image */}
              <div className="relative mb-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 mx-auto object-contain rounded-lg bg-gray-50 p-1"
                  style={{ imageRendering: 'pixelated' }}
                  loading="lazy"
                />
                
                {/* Active Status */}
                {item.status === 'active' && (
                  <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs">
                    ✓
                  </Badge>
                )}
              </div>
              
              {/* Badge Info */}
              <div className="space-y-1">
                <h4 className="font-medium text-xs text-gray-800 leading-tight line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {item.code}
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 rounded-lg transition-colors duration-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {badgesList.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum emblema encontrado</h3>
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
                  className={page === currentPage ? "bg-yellow-600" : ""}
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

export default PuhekuplaBadgesGrid;
