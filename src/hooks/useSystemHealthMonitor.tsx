
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface SystemHealth {
  isAuthenticated: boolean;
  hasHabboAccount: boolean;
  apiConnectivity: 'good' | 'slow' | 'error';
  lastChecked: Date;
  recommendations: string[];
}

export const useSystemHealthMonitor = () => {
  const { habboAccount } = useAuth();
  const [health, setHealth] = useState<SystemHealth>({
    isAuthenticated: false,
    hasHabboAccount: false,
    apiConnectivity: 'good',
    lastChecked: new Date(),
    recommendations: []
  });

  useEffect(() => {
    const checkSystemHealth = () => {
      const recommendations: string[] = [];
      
      const isAuthenticated = !!habboAccount?.id;
      const hasHabboAccount = !!habboAccount?.habbo_name;
      
      if (!isAuthenticated) {
        recommendations.push('Faça login para acessar todas as funcionalidades');
      }
      
      if (isAuthenticated && !hasHabboAccount) {
        recommendations.push('Vincule sua conta do Habbo para ver atividades dos amigos');
      }
      
      // Simulate API connectivity check (in a real app, this would ping the API)
      const apiConnectivity: 'good' | 'slow' | 'error' = 'good';
      
      setHealth({
        isAuthenticated,
        hasHabboAccount,
        apiConnectivity,
        lastChecked: new Date(),
        recommendations
      });
    };

    checkSystemHealth();
    
    // DESABILITADO: Check health every 30 seconds - estava causando re-renderizações
    // const interval = setInterval(checkSystemHealth, 30000);
    // 
    // return () => clearInterval(interval);
  }, [habboAccount]);

  const getHealthScore = (): number => {
    let score = 0;
    if (health.isAuthenticated) score += 40;
    if (health.hasHabboAccount) score += 40;
    if (health.apiConnectivity === 'good') score += 20;
    return score;
  };

  const getHealthStatus = () => {
    const score = getHealthScore();
    if (score >= 80) return { status: 'excellent', color: 'text-green-400', label: 'Excelente' };
    if (score >= 60) return { status: 'good', color: 'text-blue-400', label: 'Bom' };
    if (score >= 40) return { status: 'warning', color: 'text-yellow-400', label: 'Atenção' };
    return { status: 'error', color: 'text-red-400', label: 'Problemas' };
  };

  return {
    health,
    healthScore: getHealthScore(),
    healthStatus: getHealthStatus(),
    refresh: () => {
      setHealth(prev => ({ ...prev, lastChecked: new Date() }));
    }
  };
};
