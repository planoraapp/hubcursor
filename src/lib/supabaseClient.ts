
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback para quando Supabase não estiver configurado
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project') && !supabaseAnonKey.includes('your-anon-key')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  }

export { supabase };
