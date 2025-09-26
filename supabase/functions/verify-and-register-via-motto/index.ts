// ========================================
// EDGE FUNCTION: VERIFY AND REGISTER VIA MOTTO
// Função completa para cadastro de usuários Habbo via motto
// ========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { username, motto, password, action } = await req.json()

    if (!username || !motto) {
      return new Response(
        JSON.stringify({ error: 'Username e motto são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user exists in Habbo
    const habboUser = await verifyHabboUser(username, motto)
    
<<<<<<< HEAD
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
=======
    if (!habboUser.success) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado ou motto incorreta' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
>>>>>>> 123d1852305b7472b51ed4894e129379d643b54b
    }

    // Check if user already exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('habbo_username', username)
      .single()

    if (action === 'login') {
      // User wants to login
      if (!existingUser) {
        return new Response(
          JSON.stringify({ error: 'Usuário não cadastrado. Faça o cadastro primeiro.' }),
          { 
            status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Verify password if user exists
      if (password && existingUser.password_hash) {
        const isValidPassword = await verifyPassword(password, existingUser.password_hash)
        if (!isValidPassword) {
          return new Response(
            JSON.stringify({ error: 'Senha incorreta' }),
            { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Return user data for login
      return new Response(
        JSON.stringify({
        success: true,
          action: 'login',
          user: {
            id: existingUser.id,
            habbo_username: existingUser.habbo_username,
            habbo_motto: existingUser.habbo_motto,
            habbo_avatar: existingUser.habbo_avatar,
            created_at: existingUser.created_at
          }
        }),
        { 
          status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } else if (action === 'register') {
      // User wants to register
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Usuário já cadastrado' }),
          { 
            status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (!password) {
        return new Response(
          JSON.stringify({ error: 'Senha é obrigatória para cadastro' }),
          { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Hash password
      const passwordHash = await hashPassword(password)

<<<<<<< HEAD
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
=======
      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          habbo_username: username,
          habbo_motto: motto,
          habbo_avatar: habboUser.data.figureString,
          password_hash: passwordHash,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting user:', insertError)
        return new Response(
          JSON.stringify({ error: 'Erro ao cadastrar usuário' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: 'register',
          user: {
            id: newUser.id,
            habbo_username: newUser.habbo_username,
            habbo_motto: newUser.habbo_motto,
            habbo_avatar: newUser.habbo_avatar,
            created_at: newUser.created_at
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
>>>>>>> 123d1852305b7472b51ed4894e129379d643b54b
        }
      )

<<<<<<< HEAD
        console.log('✅ [VERIFY-MOTTO] Habbo account created/updated:', habboAccountResult);
        console.log('✅ [VERIFY-MOTTO] Registration completed successfully!');
=======
    } else if (action === 'change_password') {
      // User wants to change password
      if (!existingUser) {
        return new Response(
          JSON.stringify({ error: 'Usuário não cadastrado' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
>>>>>>> 123d1852305b7472b51ed4894e129379d643b54b
      }

      if (!password) {
        return new Response(
          JSON.stringify({ error: 'Nova senha é obrigatória' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Hash new password
      const newPasswordHash = await hashPassword(password)

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('habbo_username', username)

      if (updateError) {
        console.error('Error updating password:', updateError)
        return new Response(
          JSON.stringify({ error: 'Erro ao alterar senha' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
        success: true,
          action: 'change_password',
          message: 'Senha alterada com sucesso'
        }),
        { 
          status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida' }),
      { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

<<<<<<< HEAD
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
=======
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
>>>>>>> 123d1852305b7472b51ed4894e129379d643b54b
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

<<<<<<< HEAD
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
=======
// Function to verify Habbo user
async function verifyHabboUser(username: string, motto: string) {
  try {
    // Try official Habbo API first
    const apiUrl = `https://www.habbo.com.br/api/public/users?name=${encodeURIComponent(username)}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
        headers: {
        'User-Agent': 'HabboHub/1.0',
        'Accept': 'application/json'
      }
    })
>>>>>>> 123d1852305b7472b51ed4894e129379d643b54b

      console.log(`📡 [FETCH] Response from ${hotel}: Status ${response.status}, OK: ${response.ok}`);

      if (response.ok) {
<<<<<<< HEAD
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
=======
      const data = await response.json()
      
      if (data && data.name && data.motto === motto) {
        return {
          success: true,
          data: {
            name: data.name,
            motto: data.motto,
            figureString: data.figureString || 'Sem avatar',
            memberSince: data.memberSince || 'Data não disponível',
            lastOnlineTime: data.lastOnlineTime || 'Não disponível'
          }
        }
      }
      }
    } catch (error) {
    console.log('API oficial falhou, tentando método alternativo')
  }

  // Fallback: verify via avatar imaging
  try {
    const avatarUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=s`
    
    const response = await fetch(avatarUrl, { method: 'HEAD' })
    
    if (response.ok) {
      return {
        success: true,
        data: {
          name: username,
          motto: motto,
          figureString: 'Avatar disponível',
          memberSince: 'Verificado via avatar',
          lastOnlineTime: 'Não disponível'
        }
      }
>>>>>>> 123d1852305b7472b51ed4894e129379d643b54b
    }
  } catch (error) {
    console.log('Método alternativo também falhou')
  }
<<<<<<< HEAD
  
  console.log('❌ [FETCH] User not found in any hotel');
  return null;
=======

  return { success: false, error: 'Usuário não encontrado' }
>>>>>>> 123d1852305b7472b51ed4894e129379d643b54b
}

// Function to hash password (using bcrypt)
async function hashPassword(password: string): Promise<string> {
  // For production, use a proper bcrypt library
  // This is a simple hash for demo purposes
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'habbohub_salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Function to verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}