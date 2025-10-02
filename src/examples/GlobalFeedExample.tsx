import React from 'react';
import { useGlobalPhotoFeed } from '@/hooks/useGlobalPhotoFeed';
import { useTimestampCache } from '@/hooks/useTimestampCache';
import { formatHabboTimestamp } from '@/utils/timestampUtils';
import { GlobalPhotoFeedColumn } from '@/components/console2/GlobalPhotoFeedColumn';

/**
 * Exemplo de uso do Sistema de Feed Global Cronológico
 * 
 * Este componente demonstra como usar todas as funcionalidades
 * implementadas no sistema de feed global.
 */

export const GlobalFeedExample: React.FC = () => {
  // Hook principal do feed global
  const {
    photos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refreshFeed,
    stats
  } = useGlobalPhotoFeed({
    limit: 20,
    hotel: 'br',
    enableCache: true,
    cacheTime: 5 // 5 minutos de cache
  });

  // Hook de cache com timestamps
  const cache = useTimestampCache({
    ttl: 30, // 30 minutos
    maxSize: 100,
    enablePersistence: true
  });

  // Exemplo de uso do cache
  const handleCacheExample = () => {
    // Adicionar dados ao cache
    cache.set('example-data', { photos: photos.slice(0, 5) });
    
    // Obter dados do cache
    const cachedData = cache.get('example-data');
    console.log('Dados do cache:', cachedData);
    
    // Verificar se existe no cache
    const exists = cache.has('example-data');
    console.log('Existe no cache:', exists);
    
    // Obter estatísticas do cache
    const cacheStats = cache.getStats();
    console.log('Estatísticas do cache:', cacheStats);
  };

  // Exemplo de formatação de timestamps
  const formatExampleTimestamps = () => {
    const now = new Date();
    const examples = [
      new Date(now.getTime() - 5 * 60 * 1000), // 5 minutos atrás
      new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 horas atrás
      new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    ];

    examples.forEach((date, index) => {
      const formatted = formatHabboTimestamp(date);
      console.log(`Exemplo ${index + 1}:`, formatted);
    });
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🌍 Feed Global Cronológico
        </h1>
        <p className="text-white/60">
          Sistema completo de feed com cache inteligente e paginação
        </p>
      </div>

      {/* Estatísticas do Feed */}
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">
          📊 Estatísticas do Feed
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.totalPhotos}
            </div>
            <div className="text-sm text-white/60">Total de Fotos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {hasMore ? 'Sim' : 'Não'}
            </div>
            <div className="text-sm text-white/60">Tem Mais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {isLoadingMore ? 'Sim' : 'Não'}
            </div>
            <div className="text-sm text-white/60">Carregando Mais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {stats.cacheAge ? `${Math.floor(stats.cacheAge / 60000)}m` : 'N/A'}
            </div>
            <div className="text-sm text-white/60">Idade do Cache</div>
          </div>
        </div>
      </div>

      {/* Estatísticas do Cache */}
      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">
          🗄️ Estatísticas do Cache
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {cache.getStats().totalItems}
            </div>
            <div className="text-sm text-white/60">Total de Itens</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {cache.getStats().validItems}
            </div>
            <div className="text-sm text-white/60">Itens Válidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {cache.getStats().expiredItems}
            </div>
            <div className="text-sm text-white/60">Itens Expirados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round(cache.getStats().memoryUsage / 1024)}KB
            </div>
            <div className="text-sm text-white/60">Uso de Memória</div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={refreshFeed}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
        >
          {isLoading ? 'Atualizando...' : '🔄 Atualizar Feed'}
        </button>
        
        <button
          onClick={loadMore}
          disabled={!hasMore || isLoadingMore}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
        >
          {isLoadingMore ? 'Carregando...' : '📥 Carregar Mais'}
        </button>
        
        <button
          onClick={handleCacheExample}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          🗄️ Testar Cache
        </button>
        
        <button
          onClick={formatExampleTimestamps}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          ⏰ Testar Timestamps
        </button>
      </div>

      {/* Componente Principal do Feed */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        <GlobalPhotoFeedColumn hotel="br" />
      </div>

      {/* Exemplos de Código */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          💻 Exemplos de Código
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-2">
              Hook Principal
            </h3>
            <pre className="bg-gray-800 p-4 rounded text-green-400 text-sm overflow-x-auto">
{`const {
  photos,
  isLoading,
  hasMore,
  loadMore,
  refreshFeed,
  stats
} = useGlobalPhotoFeed({
  limit: 20,
  hotel: 'br',
  enableCache: true,
  cacheTime: 5
});`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-2">
              Cache com Timestamps
            </h3>
            <pre className="bg-gray-800 p-4 rounded text-green-400 text-sm overflow-x-auto">
{`const cache = useTimestampCache({
  ttl: 30,
  maxSize: 100,
  enablePersistence: true
});

cache.set('key', data);
const data = cache.get('key');
const exists = cache.has('key');`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-blue-400 mb-2">
              Formatação de Timestamps
            </h3>
            <pre className="bg-gray-800 p-4 rounded text-green-400 text-sm overflow-x-auto">
{`import { formatHabboTimestamp } from '@/utils/timestampUtils';

const timestamp = '2024-01-15T10:30:00Z';
const formatted = formatHabboTimestamp(timestamp);
// Resultado: "2h atrás" ou "15/01/24"`}
            </pre>
          </div>
        </div>
      </div>

      {/* Estado de Erro */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
          <h3 className="text-red-400 font-semibold mb-2">
            ❌ Erro no Feed
          </h3>
          <p className="text-red-300 text-sm">
            {error.message || 'Erro desconhecido'}
          </p>
        </div>
      )}
    </div>
  );
};
