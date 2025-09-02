
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BadgeTranslation {
  code: string;
  name: string;
  description: string;
  registrationDate?: string;
  hotel: string;
}

// Cache simples em memória para traduções
const translationCache = new Map<string, { data: BadgeTranslation[], timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

const parseHabboNewsEmblems = (html: string): BadgeTranslation[] => {
  const badges: BadgeTranslation[] = [];
  
  // Regex para capturar emblemas do HabboNews com estrutura completa
  const badgeRegex = /<div[^>]*badgecode="([^"]+)"[^>]*hotel="([^"]+)"[^>]*original-title="([^"]*)"[^>]*>/g;
  
  let match;
  while ((match = badgeRegex.exec(html)) !== null) {
    const [, code, hotel, originalTitle] = match;
    
    // Extrair nome e descrição do original-title
    const nameMatch = /<b>([^<]+)<\/b>/.exec(originalTitle);
    const descMatch = /\([^)]+\)<br \/>([^<]+)<br/.exec(originalTitle);
    const dateMatch = /Data do registro: <b>([^<]+)<\/b>/.exec(originalTitle);
    
    const name = nameMatch ? nameMatch[1] : code;
    const description = descMatch ? descMatch[1] : '';
    const registrationDate = dateMatch ? dateMatch[1] : '';
    
    badges.push({
      code: code.toUpperCase(),
      name,
      description,
      registrationDate,
      hotel
    });
  }
  
  return badges;
};

const fetchBadgeTranslations = async (language: string): Promise<BadgeTranslation[]> => {
  const cacheKey = `badges_${language}`;
  const cached = translationCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log(`📦 [BadgeTranslations] Using cached data for ${language}`);
    return cached.data;
  }
  
  try {
    console.log(`🔍 [BadgeTranslations] Fetching from HabboNews for language: ${language}`);
    
    const response = await fetch('https://www.habbonews.net/emblemoteca', {
      headers: {
        'User-Agent': 'HabboHub-BadgeTranslations/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': language === 'pt' ? 'pt-BR,pt;q=0.9' : `${language};q=0.9`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const badges = parseHabboNewsEmblems(html);
    
    console.log(`✅ [BadgeTranslations] Found ${badges.length} translated badges`);
    
    // Salvar no cache
    translationCache.set(cacheKey, { data: badges, timestamp: Date.now() });
    
    return badges;
    
  } catch (error) {
    console.error(`❌ [BadgeTranslations] Error fetching translations:`, error);
    return [];
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { badgeCode, language = 'pt' } = await req.json();
    
    console.log(`🎯 [BadgeTranslations] Request: code=${badgeCode}, language=${language}`);
    
    // Buscar todas as traduções para o idioma
    const translations = await fetchBadgeTranslations(language);
    
    // Encontrar tradução específica
    const translation = translations.find(badge => 
      badge.code.toUpperCase() === badgeCode.toUpperCase()
    );
    
    if (translation) {
      console.log(`✅ [BadgeTranslations] Found translation for ${badgeCode}`);
      return new Response(
        JSON.stringify({
          success: true,
          translation,
          cached: translationCache.has(`badges_${language}`)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      console.log(`⚠️ [BadgeTranslations] No translation found for ${badgeCode}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Translation not found',
          fallback: {
            code: badgeCode,
            name: badgeCode,
            description: `Badge ${badgeCode}`
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('❌ [BadgeTranslations] Function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
