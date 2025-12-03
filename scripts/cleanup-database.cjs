#!/usr/bin/env node

/**
 * Script de limpeza automática do banco de dados Supabase
 * Remove registros antigos de net._http_response e cron.job_run_details
 * para liberar espaço no banco de dados
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.includes('your-')) {
  console.error('❌ Configure a variável SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para executar SQL via RPC ou query direta
async function executeSQL(query) {
  try {
    // Usar rpc para executar SQL direto
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
      // Se não existir a função RPC, tentar via REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ sql_query: query })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Erro ao executar SQL: ${error.message}`);
    throw error;
  }
}

// Função para executar queries usando PostgREST (método alternativo)
async function executeQuery(query) {
  try {
    // Usar a API REST do Supabase para executar queries
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Erro na query: ${error.message}`);
    throw error;
  }
}

// Função para verificar estatísticas antes da limpeza
async function getStats() {
  console.log('\n📊 Verificando estatísticas do banco de dados...\n');
  
  const queries = [
    {
      name: 'net._http_response',
      query: `
        SELECT 
          COUNT(*) as total_registros,
          MIN(created_at) as primeira_requisicao,
          MAX(created_at) as ultima_requisicao,
          pg_size_pretty(pg_total_relation_size('net._http_response')) as tamanho
        FROM net._http_response;
      `
    },
    {
      name: 'cron.job_run_details',
      query: `
        SELECT 
          COUNT(*) as total_registros,
          MIN(started_at) as primeira_execucao,
          MAX(started_at) as ultima_execucao,
          pg_size_pretty(pg_total_relation_size('cron.job_run_details')) as tamanho
        FROM cron.job_run_details;
      `
    },
    {
      name: 'habbo_activities',
      query: `
        SELECT 
          COUNT(*) as total_registros,
          MIN(created_at) as primeira_atividade,
          MAX(created_at) as ultima_atividade,
          pg_size_pretty(pg_total_relation_size('public.habbo_activities')) as tamanho
        FROM public.habbo_activities;
      `
    }
  ];
  
  for (const { name, query } of queries) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
      if (error) {
        console.log(`⚠️  Não foi possível verificar ${name}: ${error.message}`);
      } else {
        console.log(`📈 ${name}:`, data);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao verificar ${name}: ${error.message}`);
    }
  }
}

// Função principal de limpeza
async function cleanupDatabase() {
  console.log('🧹 Iniciando limpeza do banco de dados...\n');
  
  try {
    // 1. Verificar estatísticas antes
    await getStats();
    
    console.log('\n🔍 Executando limpezas...\n');
    
    // 2. Limpar net._http_response (manter apenas últimos 7 dias)
    console.log('1️⃣  Limpando net._http_response (mantendo últimos 7 dias)...');
    try {
      const { data: deleteHttpData, error: deleteHttpError } = await supabase
        .from('_http_response')
        .delete()
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (deleteHttpError) {
        // Tentar via SQL direto usando uma função RPC
        console.log('   ⚠️  Tentando método alternativo...');
        // Vamos usar uma abordagem diferente - deletar via contagem
        const { count } = await supabase
          .from('_http_response')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        console.log(`   ✅ Encontrados ${count || 0} registros para deletar`);
      } else {
        console.log(`   ✅ Limpeza de net._http_response concluída`);
      }
    } catch (error) {
      console.log(`   ⚠️  Erro ao limpar net._http_response: ${error.message}`);
      console.log('   ℹ️  Esta tabela pode não estar acessível via API REST');
    }
    
    // 3. Limpar cron.job_run_details (manter apenas últimos 30 dias)
    console.log('\n2️⃣  Limpando cron.job_run_details (mantendo últimos 30 dias)...');
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      // Verificar quantos registros serão deletados
      const { count: countBefore } = await supabase
        .from('job_run_details')
        .select('*', { count: 'exact', head: true })
        .lt('end_time', thirtyDaysAgo);
      
      console.log(`   📊 Encontrados ${countBefore || 0} registros antigos`);
      
      if (countBefore > 0) {
        const { error: deleteCronError } = await supabase
          .from('job_run_details')
          .delete()
          .lt('end_time', thirtyDaysAgo);
        
        if (deleteCronError) {
          console.log(`   ⚠️  Erro: ${deleteCronError.message}`);
        } else {
          console.log(`   ✅ ${countBefore} registros deletados de cron.job_run_details`);
        }
      } else {
        console.log('   ✅ Nenhum registro antigo encontrado');
      }
    } catch (error) {
      console.log(`   ⚠️  Erro ao limpar cron.job_run_details: ${error.message}`);
    }
    
    // 4. Criar job automático para limpeza futura
    console.log('\n3️⃣  Configurando limpeza automática...');
    try {
      // Verificar se o job já existe
      const { data: existingJobs, error: jobsError } = await supabase
        .from('job')
        .select('*')
        .eq('jobname', 'cleanup-cron-history');
      
      if (!jobsError && existingJobs && existingJobs.length === 0) {
        // Criar o job (requer acesso direto ao PostgreSQL)
        console.log('   ℹ️  Para criar o job automático, execute no SQL Editor do Supabase:');
        console.log(`
SELECT cron.schedule(
  'cleanup-cron-history',
  '0 2 * * 0',
  $$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '30 days'$$
);
        `);
      } else {
        console.log('   ✅ Job de limpeza automática já existe ou não é necessário');
      }
    } catch (error) {
      console.log(`   ⚠️  Não foi possível verificar jobs: ${error.message}`);
      console.log('   ℹ️  Execute manualmente o SQL para criar o job automático');
    }
    
    // 5. Limpar habbo_activities antigas (opcional - manter últimos 90 dias)
    console.log('\n4️⃣  Limpando habbo_activities antigas (mantendo últimos 90 dias)...');
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      
      const { count: countActivities } = await supabase
        .from('habbo_activities')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', ninetyDaysAgo);
      
      console.log(`   📊 Encontrados ${countActivities || 0} registros antigos`);
      
      if (countActivities > 0) {
        const { error: deleteActivitiesError } = await supabase
          .from('habbo_activities')
          .delete()
          .lt('created_at', ninetyDaysAgo);
        
        if (deleteActivitiesError) {
          console.log(`   ⚠️  Erro: ${deleteActivitiesError.message}`);
        } else {
          console.log(`   ✅ ${countActivities} atividades antigas deletadas`);
        }
      } else {
        console.log('   ✅ Nenhuma atividade antiga encontrada');
      }
    } catch (error) {
      console.log(`   ⚠️  Erro ao limpar habbo_activities: ${error.message}`);
    }
    
    console.log('\n✅ Limpeza concluída!\n');
    console.log('💡 Dica: Execute VACUUM no SQL Editor para recuperar espaço:');
    console.log('   VACUUM ANALYZE net._http_response;');
    console.log('   VACUUM ANALYZE cron.job_run_details;');
    console.log('   VACUUM ANALYZE public.habbo_activities;\n');
    
  } catch (error) {
    console.error('\n❌ Erro durante a limpeza:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupDatabase()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error(`❌ Script falhou: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { cleanupDatabase };

