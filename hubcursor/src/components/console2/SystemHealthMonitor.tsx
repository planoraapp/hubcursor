
import React from 'react';
import { Shield, Wifi, Clock, Users } from 'lucide-react';

interface SystemHealthMonitorProps {
  metadata: {
    source: string;
    timestamp: string;
    hotel: string;
    count: number;
    friends_processed?: number;
    query_enabled: boolean;
    has_error: boolean;
    is_authenticated: boolean;
  };
}

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({ metadata }) => {
  const getSourceStatus = () => {
    switch (metadata.source) {
      case 'authenticated_direct_api':
        return { icon: Shield, color: 'text-green-400', label: 'API Conectada', status: 'Dados reais' };
      case 'no_data':
        return { icon: Wifi, color: 'text-yellow-400', label: 'Sem Dados', status: 'Aguardando atividades' };
      default:
        return { icon: Clock, color: 'text-gray-400', label: 'Carregando', status: 'Processando...' };
    }
  };

  const { icon: Icon, color, label, status } = getSourceStatus();

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <div>
            <div className="text-xs font-medium text-white/90">{label}</div>
            <div className="text-xs text-white/60">{status}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Users className="w-3 h-3" />
            <span>{metadata.friends_processed || 0} amigos</span>
          </div>
          <div className="text-xs text-white/40">
            Hotel: {metadata.hotel.toUpperCase()}
          </div>
        </div>
      </div>
      
      {metadata.has_error && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
          ⚠️ Erro na conexão com o backend
        </div>
      )}
      
      {!metadata.is_authenticated && (
        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-300">
          🔑 Faça login para ver atividades reais
        </div>
      )}
    </div>
  );
};
