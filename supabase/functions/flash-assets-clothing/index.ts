
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface EnhancedFlashAsset {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  colors: string[];
  thumbnailUrl: string;
  club: 'hc' | 'normal';
  rarity: 'nft' | 'hc' | 'ltd' | 'rare' | 'common';
  swfName: string;
  source: 'flash-assets-enhanced';
}

// Sistema de categorização inteligente melhorado
const ENHANCED_CATEGORY_MAPPING: Record<string, string> = {
  // Acessórios específicos
  'acc_chest': 'ca',
  'acc_head': 'ha',
  'acc_eye': 'ea',
  'acc_face': 'fa',
  'acc_waist': 'wa',
  'acc_print': 'cp',
  
  // Roupas principais
  'shirt': 'ch',
  'jacket': 'cc',
  'trousers': 'lg',
  'shoes': 'sh',
  
  // Cabeça
  'hair': 'hr',
  'hat': 'ha',
  'face': 'hd',
  
  // Novas categorias
  'effects': 'fx',
  'pets': 'pets',
  'dance': 'dance'
};

const parseAssetCategory = (filename: string): string => {
  if (!filename) return 'ch';
  
  const cleanName = filename.toLowerCase().replace('.swf', '');
  
  // Verificar prefixos específicos
  for (const [pattern, category] of Object.entries(ENHANCED_CATEGORY_MAPPING)) {
    if (cleanName.startsWith(pattern)) {
      return category;
    }
  }
  
  // Padrões nos nomes
  if (cleanName.includes('hair') || cleanName.includes('hr_')) return 'hr';
  if (cleanName.includes('hat') || cleanName.includes('cap')) return 'ha';
  if (cleanName.includes('shirt') || cleanName.includes('top')) return 'ch';
  if (cleanName.includes('jacket') || cleanName.includes('coat')) return 'cc';
  if (cleanName.includes('trouser') || cleanName.includes('pant')) return 'lg';
  if (cleanName.includes('shoe') || cleanName.includes('boot')) return 'sh';
  if (cleanName.includes('glass')) return 'ea';
  if (cleanName.includes('mask') || cleanName.includes('beard')) return 'fa';
  if (cleanName.includes('belt')) return 'wa';
  if (cleanName.includes('necklace') || cleanName.includes('badge')) return 'ca';
  
  // Efeitos especiais
  if (cleanName.includes('effect') || cleanName.includes('ghost') || 
      cleanName.includes('freeze') || cleanName.includes('butterfly') ||
      cleanName.includes('fire') || cleanName.includes('ice')) return 'fx';
  
  // Pets
  if (cleanName.includes('dog') || cleanName.includes('cat') || 
      cleanName.includes('horse') || cleanName.includes('pet')) return 'pets';
  
  // Danças
  if (cleanName.includes('dance')) return 'dance';
  
  return 'ch';
};

const parseAssetGender = (filename: string): 'M' | 'F' | 'U' => {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('_f_') || lowerName.includes('female')) return 'F';
  if (lowerName.includes('_m_') || lowerName.includes('male')) return 'M';
  if (lowerName.includes('dress') || lowerName.includes('skirt')) return 'F';
  if (lowerName.includes('beard') || lowerName.includes('moustache')) return 'M';
  
  return 'U';
};

const parseAssetFigureId = (filename: string): string => {
  const numbers = filename.match(/(\d+)/g);
  if (numbers && numbers.length > 0) {
    return numbers.sort((a, b) => parseInt(b) - parseInt(a))[0];
  }
  
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 9999).toString();
};

const generateCategoryColors = (category: string): string[] => {
  const colorSets: Record<string, string[]> = {
    'hd': ['1', '2', '3', '4', '5'],
    'hr': ['1', '2', '45', '61', '92', '104', '100'],
    'ha': ['1', '61', '92', '100', '102', '143'],
    'ea': ['1', '2', '3', '4', '61'],
    'fa': ['1', '2', '3', '61', '92'],
    'ch': ['1', '61', '92', '100', '101', '102', '143'],
    'cc': ['1', '2', '61', '92', '100', '102'],
    'ca': ['1', '61', '92', '100'],
    'cp': ['1', '2', '3', '4', '5'],
    'lg': ['1', '2', '61', '92', '100', '101'],
    'sh': ['1', '2', '61', '92', '100'],
    'wa': ['1', '61', '92'],
    'fx': ['1', '61', '92', '100'],
    'pets': ['1', '45', '61'],
    'dance': ['1']
  };
  
  return colorSets[category] || ['1', '2', '3', '4', '5'];
};

const parseAssetRarity = (filename: string): 'nft' | 'hc' | 'ltd' | 'rare' | 'common' => {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('nft')) return 'nft';
  if (lowerName.includes('ltd')) return 'ltd';
  if (lowerName.includes('hc') || lowerName.includes('club')) return 'hc';
  if (lowerName.includes('rare')) return 'rare';
  
  return 'common';
};

const generateIsolatedThumbnail = (category: string, figureId: string, colorId: string, gender: string): string => {
  const baseConfigurations: Record<string, string> = {
    'hd': `hd-180-1`,
    'hr': `hd-180-1`,
    'ha': `hd-180-1.hr-828-45`,
    'ea': `hd-180-1.hr-828-45`,
    'fa': `hd-180-1.hr-828-45`,
    'ch': `hd-180-1.hr-828-45`,
    'cc': `hd-180-1.hr-828-45.ch-665-92`,
    'ca': `hd-180-1.hr-828-45.ch-665-92`,
    'cp': `hd-180-1.hr-828-45.ch-665-92`,
    'lg': `hd-180-1.hr-828-45.ch-665-92`,
    'sh': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`,
    'wa': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`,
    'fx': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`,
    'pets': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`,
    'dance': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`
  };
  
  const baseAvatar = baseConfigurations[category] || baseConfigurations['ch'];
  const fullFigure = `${baseAvatar}.${category}-${figureId}-${colorId}`;
  
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
};

const formatAssetName = (filename: string, category: string): string => {
  const categoryNames: Record<string, string> = {
    'hd': 'Rosto', 'hr': 'Cabelo', 'ha': 'Chapéu', 'ea': 'Óculos', 'fa': 'Acessório Facial',
    'ch': 'Camiseta', 'cc': 'Casaco', 'ca': 'Acessório Peito', 'cp': 'Estampa',
    'lg': 'Calça', 'sh': 'Sapato', 'wa': 'Cintura',
    'fx': 'Efeito', 'pets': 'Pet', 'dance': 'Dança'
  };
  
  const categoryName = categoryNames[category] || 'Item';
  const namePart = filename
    .replace(/^[a-z_]+_[MFU]?_?/, '')
    .replace('.swf', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  const figureId = parseAssetFigureId(filename);
  const rarity = parseAssetRarity(filename);
  const rarityTag = rarity !== 'common' ? ` (${rarity.toUpperCase()})` : '';
  
  return `${categoryName} ${namePart || figureId}${rarityTag}`.trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 3000, category = 'all', search = '' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [EnhancedFlashAssets] Processando ${limit} assets com categorização inteligente`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Listar todos os arquivos
    const { data: files, error } = await supabase.storage
      .from('flash-assets')
      .list('', {
        limit: 3000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      throw new Error(`Storage error: ${error.message}`);
    }

    console.log(`📁 [EnhancedFlashAssets] Encontrados ${files?.length || 0} arquivos no storage`);

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({
          assets: [],
          metadata: { 
            source: 'storage-empty', 
            count: 0,
            fetchedAt: new Date().toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar todos os arquivos SWF com categorização inteligente
    let enhancedAssets: EnhancedFlashAsset[] = files
      .filter(file => file.name.endsWith('.swf'))
      .map((file, index) => {
        const filename = file.name.replace('.swf', '');
        
        // Usar o novo sistema inteligente
        const category = parseAssetCategory(filename);
        const gender = parseAssetGender(filename);
        const figureId = parseAssetFigureId(filename);
        const rarity = parseAssetRarity(filename);
        const colors = generateCategoryColors(category);
        const name = formatAssetName(filename, category);
        const thumbnailUrl = generateIsolatedThumbnail(category, figureId, '1', gender);
        
        return {
          id: `enhanced_${category}_${figureId}_${gender}`,
          name,
          category,
          gender,
          figureId,
          colors,
          thumbnailUrl,
          club: rarity === 'hc' ? 'hc' : 'normal',
          rarity,
          swfName: filename,
          source: 'flash-assets-enhanced' as const
        };
      });

    // Aplicar filtros
    if (category !== 'all') {
      enhancedAssets = enhancedAssets.filter(asset => asset.category === category);
    }

    if (search) {
      enhancedAssets = enhancedAssets.filter(asset => 
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.swfName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Aplicar limite
    enhancedAssets = enhancedAssets.slice(0, limit);

    // Estatísticas detalhadas
    const categoryStats = enhancedAssets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const rarityStats = enhancedAssets.reduce((acc, asset) => {
      acc[asset.rarity] = (acc[asset.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = {
      assets: enhancedAssets,
      metadata: {
        source: 'flash-assets-enhanced-intelligent',
        totalFiles: files.length,
        processedAssets: enhancedAssets.length,
        categoryStats,
        rarityStats,
        newCategories: ['fx', 'pets', 'dance'],
        enhancedCategories: 13,
        fetchedAt: new Date().toISOString(),
        improvements: {
          intelligentCategorization: true,
          isolatedThumbnails: true,
          rarityDetection: true,
          genderParsing: true,
          colorOptimization: true
        }
      }
    };

    console.log(`✅ [EnhancedFlashAssets] Processamento concluído:`, {
      totalAssets: enhancedAssets.length,
      categorias: Object.keys(categoryStats).length,
      raridadeDistribuida: rarityStats
    });
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [EnhancedFlashAssets] Erro:', error);
    
    return new Response(
      JSON.stringify({
        assets: [],
        metadata: {
          source: 'error',
          error: error.message,
          fetchedAt: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
