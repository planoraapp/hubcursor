import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface HabboRoom {
  id: string;
  name: string;
  description: string;
  ownerName?: string;
  ownerUniqueId?: string;
  rating?: number;
  maximumVisitors?: number;
  userCount?: number;
  tags?: string[];
  creationTime?: string;
  categoryId?: number;
  habboGroupId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { roomId, hotelDomain } = await req.json();

    if (!roomId || !hotelDomain) {
      return new Response(
        JSON.stringify({ error: 'roomId e hotelDomain são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[habbo-room-details] 🔍 Buscando detalhes do quarto ${roomId} no hotel ${hotelDomain}`);

    const url = `https://www.habbo.${hotelDomain}/api/public/rooms/${roomId}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HabboHubBot/1.0'
      }
    });

    if (response.ok) {
      const roomData: HabboRoom = await response.json();
      console.log(`[habbo-room-details] ✅ Detalhes do quarto ${roomId} encontrados: "${roomData.name}"`);
      
      return new Response(
        JSON.stringify(roomData),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (response.status === 404) {
      console.log(`[habbo-room-details] ⚠️ Quarto ${roomId} não encontrado (404) no hotel ${hotelDomain}`);
      return new Response(
        JSON.stringify({ error: 'Quarto não encontrado' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error(`[habbo-room-details] ❌ Erro ${response.status} ao buscar quarto ${roomId}: ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `Erro ao buscar quarto: ${response.statusText}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error(`[habbo-room-details] ❌ Erro de rede ao buscar detalhes do quarto:`, error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao buscar detalhes do quarto' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
