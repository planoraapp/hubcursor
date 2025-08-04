
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
  category?: string;
  rarity?: string;
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
  type?: string;
  rarity?: string;
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
  colors?: string;
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

  console.log(`📦 [PuhekuplaData] ${endpoint} raw response:`, {
    success: data.success,
    source: data.source,
    strategy: data.strategy,
    endpoint: data.endpoint,
    dataKeys: data.data ? Object.keys(data.data) : 'no data',
    hasResult: data.data?.result ? 'yes' : 'no'
  });

  if (!data.success) {
    console.error(`❌ [PuhekuplaData] API error for ${endpoint}:`, data.error);
    throw new Error(data.error || 'Unknown API error');
  }

  // Process the response data
  let processedData = data.data;
  
  // Handle API error responses (403, etc.) by converting to empty result format
  if (processedData?.status_code && processedData?.status_message) {
    console.warn(`⚠️ [PuhekuplaData] ${endpoint} returned error response:`, {
      code: processedData.status_code,
      message: processedData.status_message,
      convertingToEmptyResult: true
    });
    
    // Convert to expected format with empty results
    processedData = {
      result: createEmptyResult(endpoint),
      pagination: {
        current_page: 1,
        pages: 1,
        total: 0
      }
    };
  }

  // Ensure we have the expected structure
  if (!processedData.result) {
    console.warn(`⚠️ [PuhekuplaData] Missing result structure for ${endpoint}, creating empty result`);
    processedData = {
      result: createEmptyResult(endpoint),
      pagination: processedData.pagination || {
        current_page: 1,
        pages: 1,
        total: 0
      }
    };
  }

  console.log(`✅ [PuhekuplaData] ${endpoint} processed successfully:`, {
    hasResult: !!processedData?.result,
    resultKeys: processedData?.result ? Object.keys(processedData.result) : 'none',
    itemCount: getItemCount(processedData, endpoint),
    source: data.source,
    strategy: data.strategy,
    fetchedAt: data.fetchedAt
  });
  
  return processedData;
};

function createEmptyResult(endpoint: string) {
  switch (endpoint) {
    case 'furni':
      return { furni: [] };
    case 'clothing':
      return { clothing: [] };
    case 'badges':
      return { badges: [] };
    case 'categories':
      return { categories: [] };
    default:
      return {};
  }
}

function getItemCount(data: any, endpoint: string): number {
  if (!data?.result) return 0;
  
  switch (endpoint) {
    case 'furni':
      return data.result.furni?.length || 0;
    case 'clothing':
      return data.result.clothing?.length || 0;
    case 'badges':
      return data.result.badges?.length || 0;
    case 'categories':
      return data.result.categories?.length || 0;
    default:
      return 0;
  }
}

export const usePuhekuplaFurni = (page = 1, category = '', search = '') => {
  return useQuery({
    queryKey: ['puhekupla-furni', page, category, search],
    queryFn: () => fetchPuhekuplaData('furni', { 
      page: page.toString(), 
      category: category === 'all' ? '' : category, 
      search: search.trim()
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    enabled: true,
  });
};

export const usePuhekuplaCategories = () => {
  return useQuery({
    queryKey: ['puhekupla-categories'],
    queryFn: () => fetchPuhekuplaData('categories'),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    enabled: true,
  });
};

export const usePuhekuplaBadges = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['puhekupla-badges', page, search],
    queryFn: () => fetchPuhekuplaData('badges', { 
      page: page.toString(), 
      search: search.trim()
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    enabled: true,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    enabled: true,
  });
};
