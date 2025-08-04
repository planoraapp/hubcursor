
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PuhekuplaFurni {
  guid: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  status: string;
}

export interface PuhekuplaCategory {
  guid: string;
  name: string;
  slug: string;
  image: string;
  count: number;
}

export interface PuhekuplaBadge {
  guid: string;
  code: string;
  name: string;
  description: string;
  image: string;
  status: string;
}

export interface PuhekuplaClothing {
  guid: string;
  code: string;
  name: string;
  description: string;
  image: string;
  category: string;
  gender: string;
  status: string;
}

const fetchPuhekuplaData = async (endpoint: string, params: Record<string, string> = {}) => {
  console.log(`🚀 [PuhekuplaData] Requesting ${endpoint} with params:`, params);

  const { data, error } = await supabase.functions.invoke('puhekupla-proxy', {
    body: { endpoint, params }
  });

  if (error) {
    console.error(`❌ [PuhekuplaData] Supabase error for ${endpoint}:`, error);
    throw new Error(`Supabase function error: ${error.message}`);
  }

  if (!data) {
    console.error(`❌ [PuhekuplaData] No data received for ${endpoint}`);
    throw new Error('No data received from Puhekupla API');
  }

  if (!data.success) {
    console.error(`❌ [PuhekuplaData] API error for ${endpoint}:`, data.error);
    throw new Error(data.error || 'Unknown API error');
  }

  console.log(`✅ [PuhekuplaData] ${endpoint} loaded successfully:`, {
    hasData: !!data.data,
    dataStructure: data.data ? Object.keys(data.data) : 'no data',
    resultStructure: data.data?.result ? Object.keys(data.data.result) : 'no result',
    itemCount: data.data?.result ? Object.values(data.data.result).find(Array.isArray)?.length : 0,
    apiKeyUsed: data.apiKeyUsed,
    fetchedAt: data.fetchedAt
  });
  
  return data.data;
};

export const usePuhekuplaFurni = (page = 1, category = '', search = '') => {
  return useQuery({
    queryKey: ['puhekupla-furni', page, category, search],
    queryFn: () => fetchPuhekuplaData('furni', { 
      page: page.toString(), 
      category: category === 'all' ? '' : category, 
      search: search.trim()
    }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // Always enabled
  });
};

export const usePuhekuplaCategories = () => {
  return useQuery({
    queryKey: ['puhekupla-categories'],
    queryFn: () => fetchPuhekuplaData('categories'),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // Always enabled
  });
};

export const usePuhekuplaBadges = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['puhekupla-badges', page, search],
    queryFn: () => fetchPuhekuplaData('badges', { 
      page: page.toString(), 
      search: search.trim()
    }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // Always enabled
  });
};

export const usePuhekuplaClothing = (page = 1, category = '', search = '') => {
  return useQuery({
    queryKey: ['puhekupla-clothing', page, category, search],
    queryFn: () => fetchPuhekuplaData('clothing', { 
      page: page.toString(), 
      category: category === 'all' ? '' : category, 
      search: search.trim()
    }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // Always enabled
  });
};
