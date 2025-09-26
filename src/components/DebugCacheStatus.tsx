import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface DebugCacheStatusProps {
  queryKey: string[];
  label: string;
}

export const DebugCacheStatus: React.FC<DebugCacheStatusProps> = ({ queryKey, label }) => {
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const queryData = queryClient.getQueryData(queryKey);
    if (queryData) {
      setLastUpdate(new Date());
    }
  }, [queryClient, queryKey]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div className="font-bold">{label}</div>
      <div>Última atualização: {lastUpdate?.toLocaleTimeString() || 'Nunca'}</div>
      <div>Cache válido: {queryClient.getQueryState(queryKey)?.dataUpdatedAt ? 'Sim' : 'Não'}</div>
    </div>
  );
};
