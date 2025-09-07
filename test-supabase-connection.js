// Teste de conexão com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNzI0NTQ4MCwiZXhwIjoyMDUyODIxNDgwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Listar usuários
    const { data: users, error: usersError } = await supabase
      .from('hub_users')
      .select('habbo_username, hotel')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log('✅ Usuários encontrados:', users);
    }

    // Teste 2: Buscar habbohub especificamente
    const { data: habbohub, error: habbohubError } = await supabase
      .from('hub_users')
      .select('*')
      .eq('habbo_username', 'habbohub');

    if (habbohubError) {
      console.error('❌ Erro ao buscar habbohub:', habbohubError);
    } else {
      console.log('✅ habbohub encontrado:', habbohub);
    }

    // Teste 3: Verificar tabelas de home
    const { data: backgrounds, error: bgError } = await supabase
      .from('user_home_backgrounds')
      .select('*')
      .limit(3);

    if (bgError) {
      console.error('❌ Erro ao buscar backgrounds:', bgError);
    } else {
      console.log('✅ Backgrounds encontrados:', backgrounds);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();
