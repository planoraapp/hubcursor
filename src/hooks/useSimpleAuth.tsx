
import { useUnifiedAuth } from './useUnifiedAuth';

// Alias simples para manter compatibilidade com código existente
export const useSimpleAuth = () => {
  return useUnifiedAuth();
};
