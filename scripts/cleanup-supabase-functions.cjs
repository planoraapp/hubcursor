const fs = require('fs');
const path = require('path');

// Funções essenciais que devem ser mantidas
const ESSENTIAL_FUNCTIONS = [
  'delete-guestbook-comments',
  'habbo-unified-api', 
  'habbo-login',
  'habbo-auth',
  'sync-home-assets',
  'habbo-widgets-proxy',
  'habbo-widgets-clothing',
  'habbo-feed-optimized',
  'habbo-official-marketplace',
  'habbo-badges-validator',
  'habbo-badges-storage',
  'get-habbo-figuredata',
  'habbo-real-assets',
  'habbo-complete-profile',
  'habbo-user-search',
  'habbo-daily-activities-tracker',
  'habbo-ensure-tracked',
  'habbo-discover-users',
  'habbo-discover-online',
  'habbo-sync-user',
  'habbo-sync-batch',
  'habbo-friends-photos',
  'habbo-friends-activities-direct',
  'habbo-activity-detector',
  'habbo-news-scraper',
  'marketplace-analytics',
  'badge-translations',
  'habbo-official-ticker',
  'habbo-photos-scraper',
  'habbo-unified-api'
];

// Funções para remover (duplicadas, obsoletas, ou de teste)
const FUNCTIONS_TO_REMOVE = [
  'apply-migration',
  'create-beebop-test-account',
  'create-habbohub-admin', 
  'create-habbohub-auto',
  'setup-beebop-admin',
  'test-habbo-photos',
  'templarios-figuredata',
  'templarios-scraper',
  'habbo-api-proxy', // Consolidado em habbo-unified-api
  'habbo-feed', // Substituído por habbo-feed-optimized
  'habbo-market-real', // Consolidado em habbo-official-marketplace
  'habbo-figuredata', // Duplicado com get-habbo-figuredata
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
  'unified-clothing-api',
  'verify-and-register-via-motto',
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
  'habbo-discover-users',
  'habbo-discover-online',
  'habbo-ensure-tracked',
  'habbo-feed',
  'habbo-friends-activities-direct',
  'habbo-friends-activity-tracker',
  'habbo-friends-photos',
  'habbo-hotel-feed',
  'habbo-hotel-general-feed',
  'habbo-login',
  'habbo-market-history',
  'habbo-market-real',
  'habbo-news-scraper',
  'habbo-official-marketplace',
  'habbo-official-ticker',
  'habbo-photo-discovery',
  'habbo-photos-scraper',
  'habbo-real-assets',
  'habbo-sync-batch',
  'habbo-sync-user',
  'habbo-user-search',
  'habbo-widgets-clothing',
  'habbo-widgets-proxy',
  'marketplace-analytics',
  'populate-clothing-cache',
  'puhekupla-proxy',
  'real-badges-system',
  'register-or-reset-via-motto',
  'reset-password-via-motto',
  'sync-home-assets',
  'sync-habbo-emotion-data',
  'unified-clothing-api',
  'verify-and-register-via-motto',
  'verify-motto-and-create-account'
];

function analyzeSupabaseFunctions() {
  const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
  
  if (!fs.existsSync(functionsDir)) {
    console.log('❌ Diretório supabase/functions não encontrado');
    return;
  }

  const functions = fs.readdirSync(functionsDir).filter(item => {
    const itemPath = path.join(functionsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  console.log(`\n📊 ANÁLISE DAS FUNÇÕES SUPABASE`);
  console.log(`Total de funções encontradas: ${functions.length}`);
  
  const essential = functions.filter(f => ESSENTIAL_FUNCTIONS.includes(f));
  const toRemove = functions.filter(f => FUNCTIONS_TO_REMOVE.includes(f));
  const keep = functions.filter(f => !FUNCTIONS_TO_REMOVE.includes(f));
  
  console.log(`\n✅ FUNÇÕES ESSENCIAIS (${essential.length}):`);
  essential.forEach(f => console.log(`  - ${f}`));
  
  console.log(`\n❌ FUNÇÕES PARA REMOVER (${toRemove.length}):`);
  toRemove.forEach(f => console.log(`  - ${f}`));
  
  console.log(`\n🔄 FUNÇÕES PARA MANTER (${keep.length}):`);
  keep.forEach(f => console.log(`  - ${f}`));
  
  console.log(`\n📈 RESUMO:`);
  console.log(`  - Funções atuais: ${functions.length}`);
  console.log(`  - Funções após limpeza: ${keep.length}`);
  console.log(`  - Redução: ${functions.length - keep.length} funções (${Math.round((functions.length - keep.length) / functions.length * 100)}%)`);
  
  return {
    total: functions.length,
    essential: essential.length,
    toRemove: toRemove.length,
    toKeep: keep.length,
    functions: functions,
    removeList: toRemove,
    keepList: keep
  };
}

function createCleanupReport(analysis) {
  const report = `
# RELATÓRIO DE LIMPEZA DAS FUNÇÕES SUPABASE

## 📊 Estatísticas
- **Funções atuais**: ${analysis.total}
- **Funções após limpeza**: ${analysis.toKeep}
- **Funções removidas**: ${analysis.toRemove}
- **Redução**: ${Math.round((analysis.toRemove / analysis.total) * 100)}%

## ✅ Funções Essenciais (${analysis.essential})
${analysis.functions.filter(f => ESSENTIAL_FUNCTIONS.includes(f)).map(f => `- ${f}`).join('\n')}

## ❌ Funções para Remover (${analysis.toRemove})
${analysis.removeList.map(f => `- ${f}`).join('\n')}

## 🔄 Funções para Manter (${analysis.toKeep})
${analysis.keepList.map(f => `- ${f}`).join('\n')}

## 🎯 Benefícios da Limpeza
1. **Performance**: Menos funções = menos overhead
2. **Manutenção**: Código mais limpo e organizado
3. **Segurança**: Menos superfície de ataque
4. **Custos**: Menos execuções desnecessárias
5. **Clareza**: Foco nas funcionalidades essenciais

## ⚠️ Aviso
Este relatório é apenas uma análise. Execute a remoção manualmente para evitar problemas.
`;

  fs.writeFileSync(path.join(__dirname, '..', 'SUPABASE_FUNCTIONS_CLEANUP_REPORT.md'), report);
  console.log('\n📄 Relatório salvo em: SUPABASE_FUNCTIONS_CLEANUP_REPORT.md');
}

// Executar análise
const analysis = analyzeSupabaseFunctions();
if (analysis) {
  createCleanupReport(analysis);
}
