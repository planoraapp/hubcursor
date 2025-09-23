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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔥 [VERIFY-MOTTO] Parsing request body...');
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('❌ [VERIFY-MOTTO] JSON Parse Error:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { habbo_name, verification_code, password, action } = requestBody;

    if (!habbo_name || !action) {
      throw new Error('Missing required fields: habbo_name and action');
    }

    console.log(`🚀 [VERIFY-MOTTO] Processing ${action} for ${habbo_name}`, {
      habbo_name,
      action,
      hasCode: !!verification_code,
      hasPassword: !!password
    });

    // ===== STEP 1: GENERATE CODE =====
    if (action === 'generate') {
      console.log('🎯 [VERIFY-MOTTO] Starting GENERATE action for:', habbo_name);
      
      const habboData = await fetchHabboUser(habbo_name);
      if (!habboData) {
        console.log('❌ [VERIFY-MOTTO] User not found in any hotel:', habbo_name);
        return new Response(JSON.stringify({ 
          error: `Usuário Habbo "${habbo_name}" não encontrado em nenhum hotel. Verifique o nome e tente novamente.` 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const verificationCode = generateVerificationCode();
      const hotel = detectHotel(habboData.uniqueId);
      
      console.log('✅ [VERIFY-MOTTO] Generated code for user:', {
        habbo_name: habboData.name,
        code: verificationCode,
        hotel: hotel,
        uniqueId: habboData.uniqueId
      });
      
      return new Response(JSON.stringify({
        success: true,
        verification_code: verificationCode,
        habbo_data: habboData,
        hotel: hotel
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
      console.log('🔍 [VERIFY-MOTTO] Checking if user exists with email:', authEmail);
      const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(authEmail);
      
      if (getUserError) {
        console.error('❌ [VERIFY-MOTTO] Error checking existing user:', getUserError);
      }
      
      let user;
      let userCreated = false;

      if (existingUser.user) {
        // Usuário existe - apenas atualizar senha
        console.log('🔄 [VERIFY-MOTTO] Updating existing user password for user:', existingUser.user.id);
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.user.id,
          { password }
        );
        
        if (updateError) {
          console.error('❌ [VERIFY-MOTTO] Error updating user password:', updateError);
          throw new Error(`Erro ao atualizar senha: ${updateError.message}`);
        }
        console.log('✅ [VERIFY-MOTTO] User password updated successfully');
        user = updateData.user;
      } else {
        // Criar novo usuário
        console.log('👤 [VERIFY-MOTTO] Creating new user with email:', authEmail);
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: authEmail,
          password: password,
          email_confirm: true // Auto-confirmar email
        });

        if (createError) {
          console.error('❌ [VERIFY-MOTTO] Error creating user:', createError);
          throw new Error(`Erro ao criar usuário: ${createError.message}`);
        }
        console.log('✅ [VERIFY-MOTTO] New user created successfully:', createData.user.id);
        user = createData.user;
        userCreated = true;
      }

      // Criar ou atualizar registro em habbo_accounts
      if (user) {
        console.log('💾 [VERIFY-MOTTO] Creating/updating habbo_accounts record for user:', user.id);
        
        const habboAccountData = {
          supabase_user_id: user.id,
          habbo_name: habboData.name,
          habbo_id: habboData.uniqueId,
          hotel: hotel,
          figure_string: habboData.figureString,
          motto: habboData.motto,
          is_online: habboData.online,
          is_admin: habbo_name.toLowerCase() === 'beebop' // Admin especial para Beebop
        };
        
        console.log('📋 [VERIFY-MOTTO] Habbo account data to insert:', habboAccountData);
        
        // Tentar com diferentes estratégias
        let habboAccountResult, habboError;
        
        // Estratégia 1: Upsert normal
        const upsertResult = await supabase
          .from('habbo_accounts')
          .upsert(habboAccountData, {
            onConflict: 'supabase_user_id'
          })
          .select();
        
        habboAccountResult = upsertResult.data;
        habboError = upsertResult.error;
        
        // Estratégia 2: Se falhou, tentar INSERT direto
        if (habboError && habboError.message.includes('permission')) {
          console.log('⚠️ [VERIFY-MOTTO] Upsert failed, trying direct insert...');
          
          const insertResult = await supabase
            .from('habbo_accounts')
            .insert(habboAccountData)
            .select();
          
          habboAccountResult = insertResult.data;
          habboError = insertResult.error;
        }
        
        // Estratégia 3: Se ainda falhou, usar RPC call
        if (habboError && habboError.message.includes('permission')) {
          console.log('⚠️ [VERIFY-MOTTO] Insert failed, trying RPC call...');
          
          const rpcResult = await supabase.rpc('insert_habbo_account_via_service', {
            account_data: habboAccountData
          });
          
          if (rpcResult.error) {
            console.error('❌ [VERIFY-MOTTO] All strategies failed:', rpcResult.error);
            habboError = rpcResult.error;
          } else {
            console.log('✅ [VERIFY-MOTTO] RPC insert successful');
            habboAccountResult = [habboAccountData]; // Mock result
            habboError = null;
          }
        }

        if (habboError) {
          console.error('❌ [VERIFY-MOTTO] Error creating habbo_accounts:', habboError);
          console.error('❌ [VERIFY-MOTTO] Habbo error details:', JSON.stringify(habboError, null, 2));
          throw new Error(`Erro ao criar conta Habbo: ${habboError.message}`);
        }

        console.log('✅ [VERIFY-MOTTO] Habbo account created/updated:', habboAccountResult);
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
    console.error('❌ [VERIFY-MOTTO] Error name:', error.name);
    console.error('❌ [VERIFY-MOTTO] Error message:', error.message);
    console.error('❌ [VERIFY-MOTTO] Full error object:', JSON.stringify(error, null, 2));
    
    // Provide more specific error messages based on error type
    let detailedError = `Erro interno: ${error.message}`;
    
    if (error.message?.includes('permission denied')) {
      detailedError = 'Erro de permissão no banco de dados. Verifique as políticas RLS.';
    } else if (error.message?.includes('auth')) {
      detailedError = 'Erro de autenticação do Supabase. Verifique as credenciais.';
    } else if (error.message?.includes('network')) {
      detailedError = 'Erro de rede. Verifique sua conexão com a internet.';
    } else if (error.message?.includes('timeout')) {
      detailedError = 'Timeout na operação. Tente novamente.';
    }
    
    return new Response(JSON.stringify({ 
      error: detailedError,
      debug_info: {
        error_name: error.name,
        error_message: error.message,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ===== HELPER FUNCTIONS =====

async function fetchHabboUser(username: string): Promise<HabboUser | null> {
  console.log('🔍 [FETCH] Searching for Habbo user:', username);
  
  const hotels = ['br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'tr'];
  
  for (const hotel of hotels) {
    try {
      const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
      const url = `https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`;
      console.log(`🌐 [FETCH] Trying ${hotel}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HabboHub/1.0)',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      console.log(`📡 [FETCH] Response from ${hotel}: Status ${response.status}, OK: ${response.ok}`);

      if (response.ok) {
        const userData: HabboUser = await response.json();
        console.log(`✅ [FETCH] Found user in ${hotel}:`, JSON.stringify(userData, null, 2));
        return userData;
      } else {
        console.log(`⚠️ [FETCH] ${hotel} returned status ${response.status}: ${response.statusText}`);
        const errorText = await response.text();
        console.log(`⚠️ [FETCH] Error response body: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ [FETCH] Error checking ${hotel}:`, error.message || error);
      continue;
    }
  }
  
  console.log('❌ [FETCH] User not found in any hotel');
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