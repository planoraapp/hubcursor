/**
 * 🔄 Vercel Cron Job - Supabase Start
 * 
 * Esta função é executada automaticamente todos os dias
 * para manter o projeto Supabase ativo, evitando que pause por inatividade.
 * 
 * O que faz:
 * - Faz ping em múltiplas Edge Functions do Supabase
 * - Executa queries simples no banco de dados
 * - Registra logs de manutenção
 * 
 * Como funciona:
 * - Configurado no vercel.json como cron job
 * - Executa automaticamente sem intervenção manual
 * - Mantém o projeto ativo 24/7
 */

export const config = {
  // Executa todos os dias às 3:00 AM UTC
  // Sintaxe cron: minuto hora dia mês dia-da-semana
  // "0 3 * * *" = todo dia às 3 da manhã
  schedule: '0 3 * * *'
};

const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

export default async function handler(req, res) {
  console.log('🚀 [Supabase Start] Starting Supabase keep-alive routine...');
  
  const results = {
    timestamp: new Date().toISOString(),
    success: true,
    checks: []
  };

  try {
    // 1. Ping no banco de dados
    console.log('📊 [Supabase Start] Checking database...');
    const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    results.checks.push({
      service: 'database',
      status: dbResponse.ok ? 'healthy' : 'unhealthy',
      statusCode: dbResponse.status,
      timestamp: new Date().toISOString()
    });

    // 2. Ping na Edge Function de feed global
    console.log('🌍 [Supabase Start] Pinging global feed function...');
    const feedResponse = await fetch(`${SUPABASE_URL}/functions/v1/habbo-global-feed`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        hotel: 'br',
        limit: 5
      })
    });

    results.checks.push({
      service: 'edge-function-feed',
      status: feedResponse.ok ? 'healthy' : 'unhealthy',
      statusCode: feedResponse.status,
      timestamp: new Date().toISOString()
    });

    // 3. Ping na Edge Function de perfil completo
    console.log('👤 [Supabase Start] Pinging profile function...');
    const profileResponse = await fetch(`${SUPABASE_URL}/functions/v1/habbo-complete-profile`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        hotel: 'br',
        habbo_name: 'test'  // Nome de teste, não precisa existir
      })
    });

    results.checks.push({
      service: 'edge-function-profile',
      status: profileResponse.status < 500 ? 'healthy' : 'unhealthy', // Aceita 4xx como healthy
      statusCode: profileResponse.status,
      timestamp: new Date().toISOString()
    });

    // 4. Verificar Auth System
    console.log('🔐 [Supabase Start] Checking auth system...');
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });

    results.checks.push({
      service: 'auth-system',
      status: authResponse.ok ? 'healthy' : 'unhealthy',
      statusCode: authResponse.status,
      timestamp: new Date().toISOString()
    });

    console.log('✅ [Supabase Start] All checks completed successfully!');
    console.log('📊 [Supabase Start] Results:', JSON.stringify(results, null, 2));

    return res.status(200).json({
      success: true,
      message: '✅ Supabase keep-alive completed successfully',
      results,
      nextRun: 'Tomorrow at 3:00 AM UTC'
    });

  } catch (error) {
    console.error('❌ [Supabase Start] Error during keep-alive:', error);
    
    results.success = false;
    results.error = error.message;

    return res.status(500).json({
      success: false,
      message: '❌ Keep-alive failed',
      error: error.message,
      results
    });
  }
}

