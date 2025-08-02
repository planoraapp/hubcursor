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

    // Listar arquivos do bucket habbo-badges, incluindo subpastas
    const { data: files, error } = await supabase.storage
      .from('habbo-badges')
      .list('', {
        limit: 5000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ [BadgesStorage] Erro no storage:', error);
      throw new Error(`Storage error: ${error.message}`);
    }

    console.log(`📁 [BadgesStorage] Encontrados ${files?.length || 0} arquivos/pastas no storage`);

    if (!files || files.length === 0) {
      console.warn('⚠️ [BadgesStorage] Nenhum arquivo encontrado');
      return new Response(
        JSON.stringify({
          badges: [],
          metadata: { 
            source: 'storage-empty', 
            count: 0,
            fetchedAt: new Date().toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar arquivos dentro das subpastas
    let allFiles: any[] = [];
    
    for (const item of files) {
      if (item.name.endsWith('/')) {
        // É uma pasta, buscar arquivos dentro dela
        console.log(`📂 [BadgesStorage] Explorando pasta: ${item.name}`);
        const { data: subFiles, error: subError } = await supabase.storage
          .from('habbo-badges')
          .list(item.name, {
            limit: 2000,
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (subFiles && !subError) {
          // Adicionar o caminho da pasta ao nome do arquivo
          const filesWithPath = subFiles.map(file => ({
            ...file,
            name: `${item.name}${file.name}`,
            fullPath: `${item.name}${file.name}`
          }));
          allFiles.push(...filesWithPath);
          console.log(`📁 [BadgesStorage] Encontrados ${subFiles.length} arquivos na pasta ${item.name}`);
        }
      } else {
        // É um arquivo na raiz
        allFiles.push({
          ...item,
          fullPath: item.name
        });
      }
    }

    console.log(`📊 [BadgesStorage] Total de arquivos processados: ${allFiles.length}`);

    // Processar arquivos em badges
    let badges: BadgeItem[] = allFiles
      .filter(file => {
        const validExtensions = ['.gif', '.png', '.jpg', '.jpeg'];
        const hasValidExtension = validExtensions.some(ext => 
          file.name.toLowerCase().endsWith(ext)
        );
        const isNotDirectory = !file.name.endsWith('/');
        
        return hasValidExtension && isNotDirectory && file.name.length > 0;
      })
      .map(file => {
        const code = extractBadgeCode(file.name);
        const category = categorizeBadge(code, file.name);
        const rarity = getRarity(code);
        
        console.log(`🏷️ [BadgesStorage] Processando: ${file.name} -> ${code} (${category}) [${rarity}]`);
        
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

    console.log(`✅ [BadgesStorage] Processados ${badges.length} badges válidos`);

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      badges = badges.filter(badge => 
        badge.name.toLowerCase().includes(searchLower) ||
        badge.code.toLowerCase().includes(searchLower)
      );
      console.log(`🔍 [BadgesStorage] Após busca: ${badges.length} badges`);
    }

    if (category !== 'all') {
      badges = badges.filter(badge => badge.category === category);
      console.log(`📂 [BadgesStorage] Após filtro de categoria: ${badges.length} badges`);
    }

    // Aplicar limite
    badges = badges.slice(0, limit);

    const result = {
      badges,
      metadata: {
        source: 'storage',
        totalFiles: allFiles.length,
        processedBadges: badges.length,
        categories: getUniqueCategories(badges),
        fetchedAt: new Date().toISOString()
      }
    };

    console.log(`🎯 [BadgesStorage] Retornando ${badges.length} badges organizados`);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [BadgesStorage] Erro fatal:', error);
    
    return new Response(
      JSON.stringify({
        badges: [],
        metadata: {
          source: 'error',
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
  
  // Padrões de limpeza mais inteligentes
  code = code.replace(/^badge[_-]?/i, ''); // Remove prefixo badge
  code = code.replace(/^[0-9]+[_-]+/g, ''); // Remove números iniciais
  code = code.replace(/[_-]+$/g, ''); // Remove traços/underscores finais
  
  // Se ainda estiver vazio ou muito curto/longo, usar nome original
  if (!code || code.length < 1 || code.length > 50) {
    code = baseFilename.replace(/\.(gif|png|jpg|jpeg)$/i, '');
  }
  
  return code.toUpperCase();
}

function categorizeBadge(code: string, filename: string): string {
  const lowerCode = code.toLowerCase();
  const lowerFile = filename.toLowerCase();
  
  // Categorias por padrões mais específicos
  if (/^(adm|mod|staff|guide|helper|sup|admin|moderator)/i.test(lowerCode)) return 'official';
  if (/(ach|game|win|victory|champion|quest|mission|complete|finish|achievement)/i.test(lowerCode)) return 'achievements';
  if (/(fansite|partner|event|special|exclusive|limited|promo|collab|20\d{2}|fan)/i.test(lowerCode)) return 'fansites';
  
  // Verificar por pasta também
  if (lowerFile.includes('/official/') || lowerFile.includes('/staff/')) return 'official';
  if (lowerFile.includes('/achievement/') || lowerFile.includes('/game/')) return 'achievements';
  if (lowerFile.includes('/fansite/') || lowerFile.includes('/event/')) return 'fansites';
  
  return 'others';
}

function generateBadgeName(code: string): string {
  // Nomes especiais mais elaborados
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

  // Verificar nomes especiais
  for (const [key, name] of Object.entries(specialNames)) {
    if (code.includes(key)) {
      return `${name} ${code}`;
    }
  }

  // Nome padrão mais descritivo
  return `Emblema ${code}`;
}

function getRarity(code: string): string {
  const upperCode = code.toUpperCase();
  
  // Badges de staff são legendários
  if (/^(ADM|MOD|STAFF|SUP|GUIDE|HELPER)/i.test(upperCode)) return 'legendary';
  
  // Badges de achievements e eventos são raros
  if (/(ACH|WIN|VICTORY|CHAMPION|EVENT|SPECIAL|EXCLUSIVE|LIMITED)/i.test(upperCode)) return 'rare';
  
  // VIP, Club e fansites são incomuns
  if (/(VIP|HC|CLUB|FANSITE|PARTNER|PROMO)/i.test(upperCode)) return 'uncommon';
  
  return 'common';
}

function getUniqueCategories(badges: BadgeItem[]): string[] {
  return [...new Set(badges.map(badge => badge.category))];
}
