
// src/components/auth/AuthUtils.js
import { supabase } from '../../lib/supabaseClient';

// Generate verification code with HUB- prefix
export const generateVerificationCode = () => {
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HUB-${code}`;
};

// Get linked account by Habbo ID
export const getSupabaseLinkedAccount = async (habboId) => {
  const { data, error } = await supabase
    .from('habbo_accounts')
    .select('*')
    .eq('habbo_id', habboId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching linked account:', error);
    return null;
  }
  return data;
};

// Get linked account by Supabase user ID
export const getSupabaseLinkedAccountBySupabaseId = async (supabaseUserId) => {
  const { data, error } = await supabase
    .from('habbo_accounts')
    .select('*')
    .eq('supabase_user_id', supabaseUserId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching linked account by Supabase ID:', error);
    return null;
  }
  return data;
};

// Create linked account
export const createSupabaseLinkedAccount = async (habboId, habboName, supabaseUserId, isAdmin = false) => {
  console.log(`🔗 [Auth] Creating link: habboId=${habboId}, habboName=${habboName}, supabaseUserId=${supabaseUserId}, isAdmin=${isAdmin}`);
  
  const { data, error } = await supabase
    .from('habbo_accounts')
    .insert({
      habbo_id: habboId,
      habbo_name: habboName,
      supabase_user_id: supabaseUserId,
      is_admin: isAdmin
    })
    .select()
    .single();

  if (error) {
    console.error('❌ [Auth] Error creating link:', error);
    throw error;
  }

  console.log('✅ [Auth] Link created successfully:', data);
  return data;
};

// Get current Supabase user
export const getSupabaseUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting Supabase user:', error);
    return null;
  }
  return user;
};

// Sign out from Supabase
export const signOutSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  console.log('✅ Successfully signed out');
};
