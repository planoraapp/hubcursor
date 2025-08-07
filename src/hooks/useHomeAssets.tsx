
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HomeAsset {
  id: string;
  name: string;
  category: 'Stickers' | 'Mockups' | 'Montáveis' | 'Ícones' | 'Papel de Parede' | 'Animados';
  file_path: string;
  bucket_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupedAssets {
  'Stickers': HomeAsset[];
  'Mockups': HomeAsset[];
  'Montáveis': HomeAsset[];
  'Ícones': HomeAsset[];
  'Papel de Parede': HomeAsset[];
  'Animados': HomeAsset[];
}

export const useHomeAssets = () => {
  const [assets, setAssets] = useState<GroupedAssets>({
    'Stickers': [],
    'Mockups': [],
    'Montáveis': [],
    'Ícones': [],
    'Papel de Parede': [],
    'Animados': []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAssetUrl = (asset: HomeAsset): string => {
    const { data } = supabase.storage
      .from(asset.bucket_name)
      .getPublicUrl(asset.file_path);
    return data.publicUrl;
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('home_assets')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) {
        console.error('Error fetching assets:', fetchError);
        setError(fetchError.message);
        return;
      }

      // Group assets by category
      const groupedAssets: GroupedAssets = {
        'Stickers': [],
        'Mockups': [],
        'Montáveis': [],
        'Ícones': [],
        'Papel de Parede': [],
        'Animados': []
      };

      data?.forEach((asset) => {
        if (asset.category in groupedAssets) {
          groupedAssets[asset.category as keyof GroupedAssets].push(asset);
        }
      });

      setAssets(groupedAssets);
      console.log('✅ Assets loaded:', groupedAssets);

    } catch (error) {
      console.error('Error in fetchAssets:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const syncAssets = async () => {
    try {
      console.log('🔄 Starting asset sync...');
      
      const { error } = await supabase.functions.invoke('sync-home-assets', {
        body: JSON.stringify({})
      });

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }

      console.log('✅ Asset sync completed');
      // Refresh assets after sync
      await fetchAssets();
      
    } catch (error) {
      console.error('Error syncing assets:', error);
      setError(error instanceof Error ? error.message : 'Failed to sync assets');
      throw error;
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return {
    assets,
    loading,
    error,
    getAssetUrl,
    fetchAssets,
    syncAssets
  };
};
