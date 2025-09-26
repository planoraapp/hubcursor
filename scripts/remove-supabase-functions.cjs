const fs = require('fs');
const path = require('path');

// Funções que serão removidas (mesmo lista do backup)
const FUNCTIONS_TO_REMOVE = [
  'apply-migration',
  'create-beebop-test-account',
  'create-habbohub-admin',
  'create-habbohub-auto',
  'setup-beebop-admin',
  'test-habbo-photos',
  'templarios-figuredata',
  'templarios-scraper',
  'habbo-api-proxy',
  'habbo-feed',
  'habbo-market-real',
  'habbo-figuredata',
  'habbo-emotion-badges',
  'habbo-emotion-clothing',
  'habbo-emotion-furnis',
  'habbo-change-detector',
  'habbo-change-scheduler',
  'habbo-batch-friends-processor',
  'habbo-discover-by-badges',
  'habbo-furni-api',
  'habbo-hotel-feed',
  'habbo-hotel-general-feed',
  'habbo-market-history',
  'habbo-official-marketplace',
  'habbo-photo-discovery',
  'habbo-photos-scraper',
  'habbo-real-assets',
  'habbo-sync-batch',
  'habbo-sync-user',
  'habbo-user-search',
  'habbo-widgets-clothing',
  'habbo-widgets-proxy',
  'populate-clothing-cache',
  'puhekupla-proxy',
  'real-badges-system',
  'register-or-reset-via-motto',
  'reset-password-via-motto',
  'sync-habbo-emotion-data',
  'sync-home-assets',
  'unified-clothing-api',
  'verify-and-reset-via-motto',
  'verify-motto-and-create-account',
  'get-auth-email-for_habbo',
  'get-habbo-figuremap',
  'get-habbo-figures',
  'get-habbo-furnidata',
  'get-habbo-official-data',
  'get-official-habbo-assets',
  'get-official-habbo-clothing',
  'get-real-habbo-data',
  'get-unified-clothing-data',
  'get-unified-habbo-clothing',
  'flash-assets-clothing',
  'habbo-assets-badges',
  'habbo-api-badges',
  'habbo-badges-scraper',
  'habbo-complete-profile',
  'habbo-discover-online',
  'habbo-discover-users',
  'habbo-ensure-tracked',
  'habbo-friends-activities-direct',
  'habbo-friends-activity-tracker',
  'habbo-friends-photos',
  'habbo-login',
  'habbo-news-scraper',
  'habbo-official-ticker',
  'marketplace-analytics'
];

// Funções essenciais que devem ser mantidas
const ESSENTIAL_FUNCTIONS = [
  'badge-translations',
  'delete-guestbook-comments',
  'get-habbo-figuredata',
  'habbo-activity-detector',
  'habbo-auth',
  'habbo-badges-storage',
  'habbo-badges-validator',
  'habbo-daily-activities-tracker',
  'habbo-feed-optimized',
  'habbo-unified-api'
];

function removeFunctions() {
  const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
  
  if (!fs.existsSync(functionsDir)) {
    console.log('❌ Diretório supabase/functions não encontrado');
    return false;
  }

  console.log('\n🗑️  Removendo funções obsoletas...');
  
  let removedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const removedFunctions = [];
  const skippedFunctions = [];
  const errorFunctions = [];

  for (const functionName of FUNCTIONS_TO_REMOVE) {
    const functionPath = path.join(functionsDir, functionName);
    
    if (fs.existsSync(functionPath)) {
      try {
        // Verificar se não é uma função essencial (segurança extra)
        if (ESSENTIAL_FUNCTIONS.includes(functionName)) {
          console.log(`⚠️  PULANDO FUNÇÃO ESSENCIAL: ${functionName}`);
          skippedFunctions.push(functionName);
          skippedCount++;
          continue;
        }

        // Remover diretório inteiro
        fs.rmSync(functionPath, { recursive: true, force: true });
        removedFunctions.push(functionName);
        removedCount++;
        console.log(`✅ Removida: ${functionName}`);
      } catch (error) {
        errorFunctions.push(`${functionName}: ${error.message}`);
        errorCount++;
        console.log(`❌ Erro ao remover: ${functionName} - ${error.message}`);
      }
    } else {
      skippedFunctions.push(functionName);
      skippedCount++;
      console.log(`⏭️  Não encontrada: ${functionName}`);
    }
  }

  // Criar relatório de remoção
  const removalReport = `
# RELATÓRIO DE REMOÇÃO DAS FUNÇÕES SUPABASE - ${new Date().toISOString()}

## 📊 Estatísticas da Remoção
- **Funções removidas**: ${removedCount}
- **Funções não encontradas**: ${skippedCount}
- **Erros durante remoção**: ${errorCount}
- **Total processadas**: ${FUNCTIONS_TO_REMOVE.length}

## ✅ Funções Removidas com Sucesso (${removedCount})
${removedFunctions.map(f => `- ${f}`).join('\n')}

## ⏭️ Funções Não Encontradas (${skippedCount})
${skippedFunctions.map(f => `- ${f}`).join('\n')}

## ❌ Erros Durante Remoção (${errorCount})
${errorFunctions.map(f => `- ${f}`).join('\n')}

## 🔒 Funções Essenciais Mantidas
${ESSENTIAL_FUNCTIONS.map(f => `- ${f}`).join('\n')}

## 📍 Backup Disponível
As funções removidas estão disponíveis em: backup-supabase-functions/

## ⚠️ Próximos Passos
1. Verificar se o aplicativo ainda funciona
2. Testar Login, Home, Console e ferramentas
3. Se houver problemas, restaurar do backup
`;

  fs.writeFileSync(path.join(__dirname, '..', 'SUPABASE_FUNCTIONS_REMOVAL_REPORT.md'), removalReport);
  
  console.log(`\n📊 REMOÇÃO CONCLUÍDA:`);
  console.log(`  - Funções removidas: ${removedCount}`);
  console.log(`  - Funções não encontradas: ${skippedCount}`);
  console.log(`  - Erros: ${errorCount}`);
  console.log(`  - Relatório salvo em: SUPABASE_FUNCTIONS_REMOVAL_REPORT.md`);
  
  return removedCount > 0;
}

// Executar remoção
const success = removeFunctions();
if (success) {
  console.log('\n✅ Remoção concluída com sucesso!');
} else {
  console.log('\n❌ Nenhuma função foi removida');
}
