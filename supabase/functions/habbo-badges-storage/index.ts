
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

    // Listar arquivos do bucket habbo-badges
    const { data: files, error } = await supabase.storage
      .from('habbo-badges')
      .list('', {
        limit: 3000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ [BadgesStorage] Erro no storage:', error);
      throw new Error(`Storage error: ${error.message}`);
    }

    console.log(`📁 [BadgesStorage] Encontrados ${files?.length || 0} arquivos no storage`);

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

    // Processar arquivos em badges
    let badges: BadgeItem[] = files
      .filter(file => {
        // Aceitar mais tipos de arquivos e ignorar diretórios
        const validExtensions = ['.gif', '.png', '.jpg', '.jpeg'];
        const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        const isNotDirectory = !file.name.endsWith('/') && file.name.includes('.');
        
        const isValid = hasValidExtension && isNotDirectory;
        
        if (!isValid) {
          console.log(`⚠️ [BadgesStorage] Arquivo ignorado: ${file.name} (não é imagem válida)`);
        }
        
        return isValid;
      })
      .map(file => {
        const code = extractBadgeCode(file.name);
        const category = categorizeBadge(code, file.name);
        
        console.log(`🏷️ [BadgesStorage] Processando: ${file.name} -> ${code} (${category})`);
        
        return {
          id: code,
          code,
          name: generateBadgeName(code),
          imageUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/habbo-badges/${file.name}`,
          category,
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
        totalFiles: files.length,
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
  // Remover extensão
  let code = filename.replace(/\.(gif|png|jpg|jpeg)$/i, '');
  
  // Limpar padrões comuns
  code = code.replace(/^badge_/i, '');
  code = code.replace(/^[0-9]+__-/, '');
  code = code.replace(/[-_]+$/, '');
  
  // Se ainda estiver vazio ou muito longo, usar o nome original
  if (!code || code.length < 2 || code.length > 50) {
    code = filename.replace(/\.(gif|png|jpg|jpeg)$/i, '');
  }
  
  return code.toUpperCase();
}

function categorizeBadge(code: string, filename: string): string {
  const lowerCode = code.toLowerCase();
  const lowerFile = filename.toLowerCase();
  
  // Categorias por padrões
  if (/^(adm|mod|staff|guide|helper|sup)/i.test(lowerCode)) return 'official';
  if (/^(ach|game|win|victory|champion|quest|mission|complete|finish)/i.test(lowerCode)) return 'achievements';
  if (/(fansite|partner|event|special|exclusive|limited|promo|collab|20\d{2})/i.test(lowerCode)) return 'fansites';
  
  return 'others';
}

function generateBadgeName(code: string): string {
  // Nomes especiais
  const specialNames: Record<string, string> = {
    'ADM': 'Administrador',
    'MOD': 'Moderador', 
    'STAFF': 'Funcionário',
    'HC': 'Habbo Club',
    'VIP': 'VIP Badge'
  };

  // Verificar nomes especiais
  for (const [key, name] of Object.entries(specialNames)) {
    if (code.includes(key)) {
      return `${name} ${code}`;
    }
  }

  return `Badge ${code}`;
}

function getUniqueCategories(badges: BadgeItem[]): string[] {
  return [...new Set(badges.map(badge => badge.category))];
}
