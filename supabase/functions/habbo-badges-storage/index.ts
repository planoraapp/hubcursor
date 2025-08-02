
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface BadgeItem {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: 'storage';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 1000, search = '', category = 'all' } = await req.json().catch(() => ({}));
    
    console.log(`🏆 [BadgesStorage] Iniciando busca - limit: ${limit}, search: "${search}", category: ${category}`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let badges: BadgeItem[] = [];

    // PRIORITY 1: Buscar badges do bucket
    try {
      // Primeiro, listar todas as pastas
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('habbo-badges')
        .list('', {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (rootError) {
        console.error('❌ [BadgesStorage] Erro no storage raiz:', rootError);
        throw rootError;
      }

      console.log(`📁 [BadgesStorage] Encontrados ${rootFiles?.length || 0} itens na raiz`);

      let allFiles: any[] = [];

      if (rootFiles && rootFiles.length > 0) {
        // Explorar cada item (pasta ou arquivo)
        for (const item of rootFiles) {
          if (item.name.endsWith('/')) {
            // É uma pasta, buscar arquivos dentro dela
            console.log(`📂 [BadgesStorage] Explorando pasta: ${item.name}`);
            const { data: subFiles, error: subError } = await supabase.storage
              .from('habbo-badges')
              .list(item.name, {
                limit: 5000,
                sortBy: { column: 'name', order: 'asc' }
              });
            
            if (subFiles && !subError) {
              const filesWithPath = subFiles.map(file => ({
                ...file,
                name: `${item.name}${file.name}`,
                fullPath: `${item.name}${file.name}`
              }));
              allFiles.push(...filesWithPath);
              console.log(`✅ [BadgesStorage] ${subFiles.length} arquivos na pasta ${item.name}`);
            }
          } else {
            // É um arquivo na raiz
            allFiles.push({
              ...item,
              fullPath: item.name
            });
          }
        }
      }

      // Processar arquivos em badges
      if (allFiles.length > 0) {
        badges = allFiles
          .filter(file => {
            const validExtensions = ['.gif', '.png', '.jpg', '.jpeg'];
            return validExtensions.some(ext => 
              file.name.toLowerCase().endsWith(ext)
            ) && !file.name.endsWith('/');
          })
          .map(file => {
            const code = extractBadgeCode(file.name);
            const category = categorizeBadge(code, file.name);
            const rarity = getRarity(code);
            
            return {
              id: code,
              code,
              name: generateBadgeName(code),
              imageUrl: `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${file.fullPath || file.name}`,
              category,
              rarity,
              source: 'storage' as const
            };
          })
          .filter(badge => badge.code && badge.code.length > 0);

        console.log(`✅ [BadgesStorage] Processados ${badges.length} badges do bucket`);
      }
    } catch (bucketErr) {
      console.warn('⚠️ [BadgesStorage] Erro ao buscar do bucket:', bucketErr);
    }

    // FALLBACK: Se não encontramos badges no bucket, gerar fallback
    if (badges.length === 0) {
      console.log('🔄 [BadgesStorage] Gerando badges de fallback');
      badges = generateFallbackBadges();
    }

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      badges = badges.filter(badge => 
        badge.name.toLowerCase().includes(searchLower) ||
        badge.code.toLowerCase().includes(searchLower)
      );
    }

    if (category !== 'all') {
      badges = badges.filter(badge => badge.category === category);
    }

    // Aplicar limite
    badges = badges.slice(0, limit);

    const result = {
      badges,
      metadata: {
        source: 'storage',
        totalProcessed: badges.length,
        categories: getUniqueCategories(badges),
        fetchedAt: new Date().toISOString()
      }
    };

    console.log(`🎯 [BadgesStorage] Retornando ${badges.length} badges`);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [BadgesStorage] Erro fatal:', error);
    
    // Fallback final
    const fallbackBadges = generateFallbackBadges();
    
    return new Response(
      JSON.stringify({
        badges: fallbackBadges,
        metadata: {
          source: 'fallback',
          error: error.message,
          fetchedAt: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function extractBadgeCode(filename: string): string {
  // Extrair apenas o nome do arquivo sem a pasta
  const baseFilename = filename.split('/').pop() || filename;
  
  // Remover extensão
  let code = baseFilename.replace(/\.(gif|png|jpg|jpeg)$/i, '');
  
  // Limpeza mais inteligente
  code = code.replace(/^badge[_-]?/i, ''); // Remove prefixo badge
  code = code.replace(/^[0-9]+[_-]+/g, ''); // Remove números iniciais
  code = code.replace(/[_-]+$/g, ''); // Remove traços finais
  
  // Se ficou muito curto ou longo, usar original
  if (!code || code.length < 1 || code.length > 50) {
    code = baseFilename.replace(/\.(gif|png|jpg|jpeg)$/i, '');
  }
  
  return code.toUpperCase();
}

function categorizeBadge(code: string, filename: string): string {
  const lowerCode = code.toLowerCase();
  const lowerFile = filename.toLowerCase();
  
  if (/^(adm|mod|staff|guide|helper|sup|admin|moderator)/i.test(lowerCode)) return 'official';
  if (/(ach|game|win|victory|champion|quest|mission|complete|finish|achievement)/i.test(lowerCode)) return 'achievements';
  if (/(fansite|partner|event|special|exclusive|limited|promo|collab|20\d{2}|fan)/i.test(lowerCode)) return 'fansites';
  
  // Verificar por pasta
  if (lowerFile.includes('/official/') || lowerFile.includes('/staff/')) return 'official';
  if (lowerFile.includes('/achievement/') || lowerFile.includes('/game/')) return 'achievements';
  if (lowerFile.includes('/fansite/') || lowerFile.includes('/event/')) return 'fansites';
  
  return 'others';
}

function generateBadgeName(code: string): string {
  const specialNames: Record<string, string> = {
    'ADM': 'Administrador',
    'MOD': 'Moderador', 
    'STAFF': 'Funcionário',
    'HC': 'Habbo Club',
    'VIP': 'VIP Badge',
    'GUIDE': 'Guia do Hotel',
    'HELPER': 'Ajudante',
    'WINNER': 'Vencedor',
    'ACH': 'Achievement'
  };

  for (const [key, name] of Object.entries(specialNames)) {
    if (code.includes(key)) {
      return `${name} ${code}`;
    }
  }

  return `Emblema ${code}`;
}

function getRarity(code: string): string {
  const upperCode = code.toUpperCase();
  
  if (/^(ADM|MOD|STAFF|SUP|GUIDE|HELPER)/i.test(upperCode)) return 'legendary';
  if (/(ACH|WIN|VICTORY|CHAMPION|EVENT|SPECIAL|EXCLUSIVE|LIMITED)/i.test(upperCode)) return 'rare';
  if (/(VIP|HC|CLUB|FANSITE|PARTNER|PROMO)/i.test(upperCode)) return 'uncommon';
  
  return 'common';
}

function generateFallbackBadges(): BadgeItem[] {
  const commonBadges = [
    'ADM', 'MOD', 'VIP', 'HC1', 'HC2', 'STAFF', 'GUIDE', 'HELPER',
    'ACH_BasicClub1', 'ACH_RoomEntry1', 'ACH_Login1', 'ACH_Motto1',
    'US004', 'US005', 'US006', 'BR001', 'BR002', 'ES001', 'DE001',
    'WIN001', 'VICTORY', 'CHAMPION', 'SPECIAL001'
  ];
  
  return commonBadges.map(code => ({
    id: code,
    code,
    name: generateBadgeName(code),
    imageUrl: `https://habboassets.com/c_images/album1584/${code}.gif`,
    category: categorizeBadge(code, ''),
    rarity: getRarity(code),
    source: 'storage' as const
  }));
}

function getUniqueCategories(badges: BadgeItem[]): string[] {
  return [...new Set(badges.map(badge => badge.category))];
}
