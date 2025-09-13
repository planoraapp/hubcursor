// src/components/ViaJovemTestComponent.tsx
// Componente de teste para o sistema ViaJovem completo

import React from 'react';
import { useViaJovemComplete, useViaJovemCompleteStats } from '@/hooks/useViaJovemComplete';

export const ViaJovemTestComponent: React.FC = () => {
  const { data: categories, isLoading, error } = useViaJovemComplete();
  const { data: stats } = useViaJovemCompleteStats();

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800">🔄 Carregando dados ViaJovem...</h3>
        <p className="text-blue-600">Carregando figuredata.xml e furnidata.json...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">❌ Erro ao carregar dados ViaJovem</h3>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  if (!categories) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800">⚠️ Nenhum dado encontrado</h3>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Sistema ViaJovem Funcionando!</h3>
      
      {stats && (
        <div className="mb-4 p-3 bg-white rounded border">
          <h4 className="font-semibold text-gray-800">📊 Estatísticas:</h4>
          <p className="text-sm text-gray-600">
            <strong>{stats.totalCategories}</strong> categorias | 
            <strong> {stats.totalItems}</strong> itens totais
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(category => (
          <div key={category.id} className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-gray-800">{category.displayName}</h4>
            <p className="text-sm text-gray-600">
              {category.items.length} itens | Paleta {category.paletteId}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {category.items.slice(0, 3).map(item => (
                <div key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {item.figureId}
                </div>
              ))}
              {category.items.length > 3 && (
                <div className="text-xs bg-gray-200 px-2 py-1 rounded">
                  +{category.items.length - 3}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};