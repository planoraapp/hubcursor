import { useState, useCallback } from 'react';
import { HabboFurniService, HabboFurniItem } from '@/services/HabboFurniService';

export const useHabboFurniService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiAccessible, setApiAccessible] = useState<boolean | null>(null);

  const testApiAccess = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accessible = await HabboFurniService.testApiAccess();
      setApiAccessible(accessible);
      
      return accessible;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao testar API: ${errorMessage}`);
      setApiAccessible(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFurnitureByClassname = useCallback(async (classname: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const mobi = await HabboFurniService.getFurnitureByClassname(classname);
      return mobi;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao buscar mobi: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMultipleFurniture = useCallback(async (classnames: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await HabboFurniService.getMultipleFurniture(classnames);
      return results;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao buscar mobis: ${errorMessage}`);
      return new Map();
    } finally {
      setLoading(false);
    }
  }, []);

  const searchFurniture = useCallback(async (params: {
    category?: string;
    type?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await HabboFurniService.searchFurniture(params);
      return response;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro na busca: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    apiAccessible,
    testApiAccess,
    getFurnitureByClassname,
    getMultipleFurniture,
    searchFurniture
  };
};
