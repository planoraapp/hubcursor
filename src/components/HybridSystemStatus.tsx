
import React from 'react';
import { CheckCircle, AlertCircle, Database, RefreshCw, TrendingUp, HardDrive } from 'lucide-react';

interface SystemStatusProps {
  metadata: any;
  isLoading: boolean;
  error: any;
  badgeCount: number;
}

export const HybridSystemStatus: React.FC<SystemStatusProps> = ({
  metadata,
  isLoading,
  error,
  badgeCount
}) => {
  const getStatusIndicator = () => {
    if (isLoading) {
      return {
        icon: RefreshCw,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        status: 'CARREGANDO',
        message: 'Sistema simplificado processando...'
      };
    }
    
    if (error) {
      return {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        status: 'ERRO',
        message: `Erro: ${error.message}`
      };
    }
    
    if (metadata?.fallbackMode) {
      return {
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        status: 'MODO FALLBACK',
        message: 'Sistema usando dados de emergência'
      };
    }
    
    return {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      status: 'OPERACIONAL',
      message: 'Sistema simplificado funcionando perfeitamente'
    };
  };

  const status = getStatusIndicator();
  const IconComponent = status.icon;

  return (
    <div className={`${status.bgColor} ${status.borderColor} border-2 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent 
            className={`w-5 h-5 ${status.color} ${isLoading ? 'animate-spin' : ''}`} 
          />
          <span className={`font-bold ${status.color}`}>
            SISTEMA SIMPLIFICADO: {status.status}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Database className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">
              {badgeCount} Emblemas
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <HardDrive className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-700">
              Storage Supabase
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-700 mb-2">
        {status.message}
      </div>
      
      {metadata && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-white bg-opacity-60 rounded px-2 py-1">
            <span className="text-gray-600">Fonte Principal:</span>
            <span className="font-medium ml-1">
              {metadata.primarySource || 'Supabase Storage'}
            </span>
          </div>
          
          <div className="bg-white bg-opacity-60 rounded px-2 py-1">
            <span className="text-gray-600">Fallback:</span>
            <span className="font-medium ml-1">
              {metadata.fallbackSource || 'HabboWidgets'}
            </span>
          </div>
          
          <div className="bg-white bg-opacity-60 rounded px-2 py-1">
            <span className="text-gray-600">Última Atualização:</span>
            <span className="font-medium ml-1">
              {metadata.timestamp ? 
                new Date(metadata.timestamp).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : 
                'N/A'
              }
            </span>
          </div>
          
          <div className="bg-white bg-opacity-60 rounded px-2 py-1">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium ml-1 text-green-600">
              Simplificado
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
