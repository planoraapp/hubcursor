// Componente para monitoramento de performance
import React, { useState, useEffect } from 'react';
import { habboCacheService } from '@/services/habboCacheService';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
  className = ''
}) => {
  const [stats, setStats] = useState(habboCacheService.getCacheStats());
  const [isVisible, setIsVisible] = useState(false);
  
  // Atualizar estatísticas a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(habboCacheService.getCacheStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getPerformanceColor = (totalKeys: number) => {
    if (totalKeys < 10) return 'text-green-600';
    if (totalKeys < 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  if (!isVisible && !showDetails) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Mostrar Monitor de Performance"
      >
        📊
      </button>
    );
  }
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📊 Monitor de Performance
        </h3>
        {!showDetails && (
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Estatísticas do Cache */}
        <div className="bg-gray-50 rounded-md p-3">
          <h4 className="font-medium text-gray-700 mb-2">Cache Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Keys:</span>
              <span className={`ml-2 font-medium ${getPerformanceColor(stats.totalKeys)}`}>
                {stats.totalKeys}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Expired Keys:</span>
              <span className="ml-2 font-medium text-orange-600">
                {stats.expiredKeys}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Memory Usage:</span>
              <span className="ml-2 font-medium text-blue-600">
                {formatBytes(stats.memoryUsage)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Indicadores de Performance */}
        <div className="bg-gray-50 rounded-md p-3">
          <h4 className="font-medium text-gray-700 mb-2">Performance Indicators</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cache Hit Rate:</span>
              <span className={`font-medium ${
                stats.totalKeys > 0 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {stats.totalKeys > 0 ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Memory Efficiency:</span>
              <span className={`font-medium ${
                stats.memoryUsage < 1000000 ? 'text-green-600' : 
                stats.memoryUsage < 5000000 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stats.memoryUsage < 1000000 ? 'Excellent' : 
                 stats.memoryUsage < 5000000 ? 'Good' : 'High Usage'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Ações */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              habboCacheService.clearAllCache();
              setStats(habboCacheService.getCacheStats());
            }}
            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            🧹 Clear Cache
          </button>
          <button
            onClick={() => setStats(habboCacheService.getCacheStats())}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
        
        {/* Informações Adicionais */}
        {showDetails && (
          <div className="bg-blue-50 rounded-md p-3 text-sm text-blue-800">
            <h5 className="font-medium mb-1">💡 Dicas de Performance:</h5>
            <ul className="space-y-1 text-xs">
              <li>• Cache keys são limpos automaticamente quando expiram</li>
              <li>• Memory usage inclui todos os dados em cache</li>
              <li>• Expired keys são removidas a cada 5 minutos</li>
              <li>• Use "Clear Cache" apenas se necessário</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
