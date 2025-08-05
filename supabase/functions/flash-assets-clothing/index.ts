
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sistema de categorização COMPLETO e inteligente
const parseAssetCategory = (swfName: string): string => {
  if (!swfName || typeof swfName !== 'string') {
    console.warn('⚠️ [CategoryParser] Invalid swfName:', swfName);
    return 'misc';
  }

  const lowerSwf = swfName.toLowerCase();
  
  // 1. CABEÇA E ROSTO
  if (lowerSwf.includes('hair') || lowerSwf.includes('hr_') || 
      lowerSwf.match(/h[a-z]*r[0-9]/) || lowerSwf.includes('_hair_')) return 'hr';
  
  if (lowerSwf.includes('head') || lowerSwf.includes('hd_') || 
      lowerSwf.includes('face') || lowerSwf.match(/hd[0-9]/)) return 'hd';
  
  if (lowerSwf.includes('hat') || lowerSwf.includes('ha_') || 
      lowerSwf.includes('cap') || lowerSwf.includes('helmet') || 
      lowerSwf.includes('crown') || lowerSwf.includes('tiara')) return 'ha';
  
  if (lowerSwf.includes('eye') || lowerSwf.includes('ea_') || 
      lowerSwf.includes('glass') || lowerSwf.includes('sunglass') || 
      lowerSwf.includes('monocle')) return 'ea';
  
  if (lowerSwf.includes('mask') || lowerSwf.includes('fa_') || 
      lowerSwf.includes('beard') || lowerSwf.includes('mustache')) return 'fa';

  // 2. CORPO E ROUPAS
  if (lowerSwf.includes('shirt') || lowerSwf.includes('ch_') || 
      lowerSwf.includes('top') || lowerSwf.includes('blouse') || 
      lowerSwf.includes('tshirt') || lowerSwf.includes('t-shirt') || 
      lowerSwf.match(/ch[0-9]/) || lowerSwf.includes('_shirt_')) return 'ch';
  
  if (lowerSwf.includes('coat') || lowerSwf.includes('cc_') || 
      lowerSwf.includes('jacket') || lowerSwf.includes('blazer') || 
      lowerSwf.includes('hoodie') || lowerSwf.includes('cardigan')) return 'cc';
  
  if (lowerSwf.includes('chest') || lowerSwf.includes('ca_') || 
      lowerSwf.includes('tie') || lowerSwf.includes('necklace') || 
      lowerSwf.includes('badge') || lowerSwf.includes('medal')) return 'ca';
  
  if (lowerSwf.includes('print') || lowerSwf.includes('cp_') || 
      lowerSwf.includes('logo') || lowerSwf.includes('emblem')) return 'cp';

  // 3. PERNAS E PÉS
  if (lowerSwf.includes('trouser') || lowerSwf.includes('lg_') || 
      lowerSwf.includes('pant') || lowerSwf.includes('jean') || 
      lowerSwf.includes('short') || lowerSwf.includes('skirt') || 
      lowerSwf.match(/lg[0-9]/) || lowerSwf.includes('_leg_')) return 'lg';
  
  if (lowerSwf.includes('shoe') || lowerSwf.includes('sh_') || 
      lowerSwf.includes('boot') || lowerSwf.includes('sneaker') || 
      lowerSwf.includes('sandal') || lowerSwf.includes('heel') || 
      lowerSwf.match(/sh[0-9]/)) return 'sh';
  
  if (lowerSwf.includes('waist') || lowerSwf.includes('wa_') || 
      lowerSwf.includes('belt') || lowerSwf.includes('chain')) return 'wa';

  // 4. ESPECIAIS
  if (lowerSwf.includes('effect') || lowerSwf.includes('fx_') || 
      lowerSwf.includes('magic') || lowerSwf.includes('glow')) return 'fx';
  
  if (lowerSwf.includes('pet') || lowerSwf.includes('animal')) return 'pets';
  
  if (lowerSwf.includes('dance') || lowerSwf.includes('emote')) return 'dance';

  // 5. FALLBACK INTELIGENTE por padrões comuns
  if (lowerSwf.match(/^[a-z]{2,3}_[0-9]/)) {
    const prefix = lowerSwf.substring(0, 2);
    const validCategories = ['hr', 'hd', 'ha', 'ea', 'fa', 'ch', 'cc', 'ca', 'cp', 'lg', 'sh', 'wa'];
    if (validCategories.includes(prefix)) return prefix;
  }

  // 6. Fallback final - analisar contexto do nome
  if (lowerSwf.includes('male') || lowerSwf.includes('female') || 
      lowerSwf.includes('_m_') || lowerSwf.includes('_f_')) {
    // Se tem indicador de gênero, provavelmente é roupa
    return 'ch';
  }

  console.warn(`⚠️ [CategoryParser] Categoria não identificada para: ${swfName}, usando 'misc'`);
  return 'misc';
};

const parseAssetGender = (swfName: string): 'M' | 'F' | 'U' => {
  const lowerSwf = swfName.toLowerCase();
  if (lowerSwf.includes('_f_') || lowerSwf.includes('female') || lowerSwf.includes('_girl_')) return 'F';
  if (lowerSwf.includes('_m_') || lowerSwf.includes('male') || lowerSwf.includes('_boy_')) return 'M';
  return 'U';
};

const parseAssetFigureId = (swfName: string): string => {
  // Extrair números do nome do arquivo de forma mais inteligente
  const numberMatches = swfName.match(/(\d+)/g);
  if (numberMatches && numberMatches.length > 0) {
    // Pegar o maior número (geralmente é o ID do item)
    return numberMatches.sort((a, b) => parseInt(b) - parseInt(a))[0];
  }
  
  // Gerar ID determinístico baseado no hash do nome
  let hash = 0;
  for (let i = 0; i < swfName.length; i++) {
    const char = swfName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 9999).toString();
};

const parseAssetRarity = (swfName: string): 'nft' | 'hc' | 'ltd' | 'rare' | 'common' => {
  const lowerSwf = swfName.toLowerCase();
  if (lowerSwf.includes('nft')) return 'nft';
  if (lowerSwf.includes('hc') || lowerSwf.includes('club')) return 'hc';
  if (lowerSwf.includes('ltd') || lowerSwf.includes('limited')) return 'ltd';
  if (lowerSwf.includes('rare') || lowerSwf.includes('exclusive')) return 'rare';
  return 'common';
};

const generateCategoryColors = (category: string): string[] => {
  const colorSets: Record<string, string[]> = {
    'hd': ['1', '2', '3', '4', '5', '6', '7'], // Tons de pele
    'hr': ['1', '2', '3', '4', '5', '45', '44', '43', '42', '41', '61', '92', '100', '101', '102'], // Cabelos
    'ch': ['1', '2', '3', '4', '5', '61', '92', '100', '101', '102', '104', '105'], // Roupas
    'cc': ['1', '2', '3', '4', '61', '92', '100', '101'],
    'lg': ['1', '2', '3', '4', '5', '61', '92', '100', '101'],
    'sh': ['1', '2', '3', '4', '61', '92', '100'],
    'ha': ['1', '2', '3', '4', '61', '92', '100'],
    'ea': ['1', '2', '3', '4', '61', '92'],
    'fa': ['1', '2', '3', '4'],
    'ca': ['1', '61', '92', '100', '101'],
    'cp': ['1', '2', '3', '4', '5'],
    'wa': ['1', '61', '92', '100']
  };
  
  return colorSets[category] || ['1', '2', '3', '4', '5'];
};

const generateIsolatedThumbnail = (category: string, figureId: string, color: string, gender: string): string => {
  // Gerar thumbnail isolada focando na parte específica
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${color}&gender=${gender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { limit = 3000, search = '', gender = 'M', rarity = 'all' } = await req.json();

    console.log('🌐 [FlashAssetsClothing] Buscando assets com parâmetros:', { 
      limit, 
      search, 
      gender, 
      rarity,
      timestamp: new Date().toISOString()
    });

    // CORREÇÃO: Buscar TODOS os assets SEM filtro de categoria
    const { data: files, error } = await supabase.storage
      .from('flash-assets')
      .list('', {
        limit,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ [FlashAssetsClothing] Storage error:', error);
      throw error;
    }

    if (!files || files.length === 0) {
      console.warn('⚠️ [FlashAssetsClothing] Nenhum arquivo encontrado no storage');
      return new Response(JSON.stringify({ 
        assets: [], 
        metadata: { total: 0, categories: {}, rarities: {} }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📁 [FlashAssetsClothing] ${files.length} arquivos encontrados no storage`);

    // Processar e categorizar TODOS os assets
    const processedAssets = files
      .filter(file => file.name.endsWith('.swf') || file.name.endsWith('.png'))
      .map(file => {
        const swfName = file.name.replace(/\.(swf|png)$/, '');
        const category = parseAssetCategory(swfName);
        const detectedGender = parseAssetGender(swfName);
        const figureId = parseAssetFigureId(swfName);
        const rarity = parseAssetRarity(swfName);

        return {
          id: `${category}_${figureId}_${detectedGender}`,
          name: swfName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category,
          gender: detectedGender,
          figureId,
          colors: generateCategoryColors(category),
          thumbnailUrl: generateIsolatedThumbnail(category, figureId, '1', detectedGender === 'U' ? gender : detectedGender),
          club: rarity === 'hc' ? 'hc' : 'normal',
          rarity,
          swfName,
          source: 'flash-assets-enhanced-v2'
        };
      })
      .filter(asset => {
        // Filtros aplicados APÓS categorização
        const matchesSearch = !search || asset.name.toLowerCase().includes(search.toLowerCase()) || 
                             asset.swfName.toLowerCase().includes(search.toLowerCase());
        const matchesGender = asset.gender === 'U' || asset.gender === gender;
        const matchesRarity = rarity === 'all' || asset.rarity === rarity;
        
        return matchesSearch && matchesGender && matchesRarity;
      });

    // Calcular estatísticas COMPLETAS
    const categoryStats = processedAssets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const rarityStats = processedAssets.reduce((acc, asset) => {
      acc[asset.rarity] = (acc[asset.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const metadata = {
      total: processedAssets.length,
      totalFiles: files.length,
      categories: categoryStats,
      rarities: rarityStats,
      filters: { search, gender, rarity },
      timestamp: new Date().toISOString()
    };

    console.log('✅ [FlashAssetsClothing] Processamento concluído:', {
      totalProcessados: processedAssets.length,
      totalArquivos: files.length,
      categorias: Object.keys(categoryStats).length,
      estatisticasCategorias: categoryStats,
      estatisticasRaridade: rarityStats
    });

    return new Response(JSON.stringify({
      assets: processedAssets,
      metadata
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [FlashAssetsClothing] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      assets: [],
      metadata: { total: 0, categories: {}, rarities: {} }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
