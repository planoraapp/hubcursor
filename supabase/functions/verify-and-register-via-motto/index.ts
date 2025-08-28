// ========================================
// EDGE FUNCTION: VERIFY AND REGISTER VIA MOTTO
// Função completa para cadastro de usuários Habbo via motto
// ========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  memberSince: string;
  profileVisible: boolean;
}

serve(async (req) => {
  console.log('🔥 [VERIFY-MOTTO] Edge function called - Method:', req.method, 'URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔥 [VERIFY-MOTTO] Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔥 [VERIFY-MOTTO] Creating Supabase client...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Service role para poder criar usuários
    )

    console.log('🔥 [VERIFY-MOTTO] Parsing request body...');
    const { habbo_name, verification_code, password, action } = await req.json()

    console.log(`🚀 [VERIFY-MOTTO] Processing ${action} for ${habbo_name}`, {
      habbo_name,
      action,
      hasCode: !!verification_code,
      hasPassword: !!password
    });

    // ===== STEP 1: GENERATE CODE =====
    if (action === 'generate') {
      const habboData = await fetchHabboUser(habbo_name);
      if (!habboData) {
        return new Response(JSON.stringify({ 
          error: 'Usuário Habbo não encontrado. Verifique o nome.' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const verificationCode = generateVerificationCode();
      
      return new Response(JSON.stringify({
        success: true,
        verification_code: verificationCode,
        habbo_data: habboData,
        hotel: detectHotel(habboData.uniqueId)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ===== STEP 2: VERIFY CODE =====
    if (action === 'verify') {
      const habboData = await fetchHabboUser(habbo_name);
      if (!habboData) {
        return new Response(JSON.stringify({ 
          error: 'Usuário Habbo não encontrado durante verificação.' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verificar se o código está no motto
      const mottoUpperCase = habboData.motto.toUpperCase();
      const codeUpperCase = verification_code.toUpperCase();
      
      if (!mottoUpperCase.includes(codeUpperCase)) {
        return new Response(JSON.stringify({ 
          error: `Código ${verification_code} não encontrado na sua missão. Sua missão atual: "${habboData.motto}"` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        verified: true,
        habbo_data: habboData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ===== STEP 3: COMPLETE REGISTRATION =====
    if (action === 'complete') {
      const habboData = await fetchHabboUser(habbo_name);
      if (!habboData) {
        return new Response(JSON.stringify({ 
          error: 'Usuário Habbo não encontrado durante registro.' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verificar código novamente
      const mottoUpperCase = habboData.motto.toUpperCase();
      const codeUpperCase = verification_code.toUpperCase();
      
      if (!mottoUpperCase.includes(codeUpperCase)) {
        return new Response(JSON.stringify({ 
          error: 'Código de verificação inválido ou não encontrado na missão.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Criar email único para o usuário
      const authEmail = `${habboData.uniqueId}@habbohub.com`;
      const hotel = detectHotel(habboData.uniqueId);

      // Verificar se usuário já existe
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(authEmail);
      
      let user;
      let userCreated = false;

      if (existingUser.user) {
        // Usuário existe - apenas atualizar senha
        console.log('🔄 [VERIFY-MOTTO] Updating existing user password...');
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.user.id,
          { password }
        );
        
        if (updateError) {
          throw new Error(`Erro ao atualizar senha: ${updateError.message}`);
        }
        user = updateData.user;
      } else {
        // Criar novo usuário
        console.log('👤 [VERIFY-MOTTO] Creating new user...');
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: authEmail,
          password: password,
          email_confirm: true // Auto-confirmar email
        });

        if (createError) {
          throw new Error(`Erro ao criar usuário: ${createError.message}`);
        }
        user = createData.user;
        userCreated = true;
      }

      // Criar ou atualizar registro em habbo_accounts
      if (user) {
        console.log('💾 [VERIFY-MOTTO] Creating/updating habbo_accounts record...');
        
        const { error: habboError } = await supabase
          .from('habbo_accounts')
          .upsert({
            supabase_user_id: user.id,
            habbo_name: habboData.name,
            habbo_id: habboData.uniqueId,
            hotel: hotel,
            figure_string: habboData.figureString,
            motto: habboData.motto,
            is_online: habboData.online,
            is_admin: habbo_name.toLowerCase() === 'beebop' // Admin especial para Beebop
          }, {
            onConflict: 'supabase_user_id'
          });

        if (habboError) {
          console.error('❌ [VERIFY-MOTTO] Error creating habbo_accounts:', habboError);
          throw new Error(`Erro ao criar conta Habbo: ${habboError.message}`);
        }

        console.log('✅ [VERIFY-MOTTO] Registration completed successfully!');
      }

      return new Response(JSON.stringify({
        success: true,
        user_created: userCreated,
        message: userCreated ? 'Conta criada com sucesso!' : 'Senha atualizada com sucesso!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [VERIFY-MOTTO] Error in verify-and-register-via-motto:', error);
    console.error('❌ [VERIFY-MOTTO] Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: `Erro interno: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ===== HELPER FUNCTIONS =====

async function fetchHabboUser(username: string): Promise<HabboUser | null> {
  console.log('🔍 Searching for Habbo user:', username);
  
  const hotels = ['br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'tr'];
  
  for (const hotel of hotels) {
    try {
      const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
      const url = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
      console.log(`🌐 Trying ${hotel}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HabboHub/1.0)',
        },
      });

      if (response.ok) {
        const userData: HabboUser = await response.json();
        console.log(`✅ Found user in ${hotel}:`, userData);
        return userData;
      }
    } catch (error) {
      console.log(`❌ Error checking ${hotel}:`, error);
      continue;
    }
  }
  
  console.log('❌ User not found in any hotel');
  return null;
}

function generateVerificationCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'HUB-';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function detectHotel(uniqueId: string): string {
  if (uniqueId.startsWith('hhbr-')) return 'br';
  if (uniqueId.startsWith('hhcom-')) return 'com';
  if (uniqueId.startsWith('hhes-')) return 'es';
  if (uniqueId.startsWith('hhfr-')) return 'fr';
  if (uniqueId.startsWith('hhde-')) return 'de';
  if (uniqueId.startsWith('hhit-')) return 'it';
  if (uniqueId.startsWith('hhnl-')) return 'nl';
  if (uniqueId.startsWith('hhfi-')) return 'fi';
  if (uniqueId.startsWith('hhtr-')) return 'tr';
  return 'com'; // fallback
}