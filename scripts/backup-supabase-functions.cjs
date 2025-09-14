const fs = require('fs');
const path = require('path');

// Funções que serão removidas (66 funções)
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

function createBackup() {
  const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
  const backupDir = path.join(__dirname, '..', 'backup-supabase-functions');
  
  if (!fs.existsSync(functionsDir)) {
    console.log('❌ Diretório supabase/functions não encontrado');
    return false;
  }

  // Criar diretório de backup
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('📁 Diretório de backup criado');
  }

  let backedUpCount = 0;
  let skippedCount = 0;

  console.log('\n🔄 Criando backup das funções...');
  
  for (const functionName of FUNCTIONS_TO_REMOVE) {
    const sourcePath = path.join(functionsDir, functionName);
    const backupPath = path.join(backupDir, functionName);
    
    if (fs.existsSync(sourcePath)) {
      try {
        // Copiar diretório inteiro
        copyDirectory(sourcePath, backupPath);
        backedUpCount++;
        console.log(`✅ Backup: ${functionName}`);
      } catch (error) {
        console.log(`❌ Erro no backup: ${functionName} - ${error.message}`);
      }
    } else {
      skippedCount++;
      console.log(`⏭️  Não encontrada: ${functionName}`);
    }
  }

  // Criar relatório de backup
  const backupReport = `
# BACKUP DAS FUNÇÕES SUPABASE - ${new Date().toISOString()}

## 📊 Estatísticas do Backup
- **Funções encontradas**: ${backedUpCount}
- **Funções não encontradas**: ${skippedCount}
- **Total processadas**: ${FUNCTIONS_TO_REMOVE.length}

## ✅ Funções com Backup
${FUNCTIONS_TO_REMOVE.filter(f => fs.existsSync(path.join(functionsDir, f))).map(f => `- ${f}`).join('\n')}

## ⏭️ Funções Não Encontradas
${FUNCTIONS_TO_REMOVE.filter(f => !fs.existsSync(path.join(functionsDir, f))).map(f => `- ${f}`).join('\n')}

## 📍 Localização do Backup
${backupDir}

## ⚠️ Importante
Este backup foi criado antes da remoção das funções. Use apenas para restaurar se necessário.
`;

  fs.writeFileSync(path.join(backupDir, 'BACKUP_REPORT.md'), backupReport);
  
  console.log(`\n📊 BACKUP CONCLUÍDO:`);
  console.log(`  - Funções com backup: ${backedUpCount}`);
  console.log(`  - Funções não encontradas: ${skippedCount}`);
  console.log(`  - Backup salvo em: ${backupDir}`);
  
  return backedUpCount > 0;
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// Executar backup
const success = createBackup();
if (success) {
  console.log('\n✅ Backup criado com sucesso!');
} else {
  console.log('\n❌ Falha ao criar backup');
}
