
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  link: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌐 [News Scraper] Fetching Habbo news...');

    const response = await fetch('https://www.habbo.com.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Habbo homepage: ${response.status}`);
    }

    const html = await response.text();
    console.log('📄 [News Scraper] HTML fetched, parsing news...');

    // Extract news from HTML (simplified parser)
    const newsItems: NewsItem[] = [];
    
    // Look for news patterns in the HTML
    const newsRegex = /<article[^>]*class="[^"]*news[^"]*"[^>]*>(.*?)<\/article>/gis;
    let match;
    let counter = 0;

    while ((match = newsRegex.exec(html)) && counter < 6) {
      const articleHtml = match[1];
      
      // Extract title
      const titleMatch = articleHtml.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/is);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

      // Extract summary
      const summaryMatch = articleHtml.match(/<p[^>]*>(.*?)<\/p>/is);
      const summary = summaryMatch ? summaryMatch[1].replace(/<[^>]*>/g, '').trim() : '';

      // Extract image
      const imageMatch = articleHtml.match(/src="([^"]*(?:jpg|png|gif|webp)[^"]*)"/is);
      const image = imageMatch ? imageMatch[1] : '';

      // Extract link
      const linkMatch = articleHtml.match(/href="([^"]*)"/is);
      const link = linkMatch ? linkMatch[1] : '';

      if (title && summary) {
        newsItems.push({
          id: `news_${counter + 1}_${Date.now()}`,
          title,
          summary: summary.substring(0, 200) + (summary.length > 200 ? '...' : ''),
          image: image.startsWith('http') ? image : `https://www.habbo.com.br${image}`,
          date: new Date().toISOString().split('T')[0],
          link: link.startsWith('http') ? link : `https://www.habbo.com.br${link}`
        });
        counter++;
      }
    }

    // If no news found, provide fallback
    if (newsItems.length === 0) {
      console.log('⚠️ [News Scraper] No news found, using fallback data');
      newsItems.push(
        {
          id: 'fallback_1',
          title: 'Habbo Hotel - Novidades da Semana',
          summary: 'Confira as últimas novidades, eventos e atualizações do Habbo Hotel Brasil.',
          image: 'https://www.habbo.com.br/habbo-imaging/badge/b05114s36135s99999.gif',
          date: new Date().toISOString().split('T')[0],
          link: 'https://www.habbo.com.br'
        },
        {
          id: 'fallback_2',
          title: 'Eventos Especiais no Habbo',
          summary: 'Participe dos eventos especiais e ganhe recompensas exclusivas no jogo.',
          image: 'https://www.habbo.com.br/habbo-imaging/badge/b06114s36135s99999.gif',
          date: new Date().toISOString().split('T')[0],
          link: 'https://www.habbo.com.br'
        }
      );
    }

    console.log(`✅ [News Scraper] Found ${newsItems.length} news items`);

    return new Response(
      JSON.stringify({
        news: newsItems,
        metadata: {
          source: 'habbo.com.br',
          fetchedAt: new Date().toISOString(),
          count: newsItems.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [News Scraper] Error:', error);
    
    return new Response(
      JSON.stringify({
        news: [
          {
            id: 'error_fallback',
            title: 'Habbo Hotel Brasil',
            summary: 'Visite o site oficial do Habbo para as últimas notícias e atualizações.',
            image: 'https://www.habbo.com.br/habbo-imaging/badge/b05114s36135s99999.gif',
            date: new Date().toISOString().split('T')[0],
            link: 'https://www.habbo.com.br'
          }
        ],
        metadata: {
          source: 'fallback',
          fetchedAt: new Date().toISOString(),
          error: error.message
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
