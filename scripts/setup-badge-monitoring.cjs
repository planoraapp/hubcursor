const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🔧 Configurando monitoramento automático de badges...\n');

// Verificar se o habbo-downloader está instalado
const checkHabboDownloader = async () => {
  try {
    console.log('📦 Verificando habbo-downloader...');
    await execAsync('npx habbo-downloader@latest --version');
    console.log('✅ habbo-downloader já está disponível');
    return true;
  } catch (error) {
    console.log('⚠️  habbo-downloader não encontrado, será baixado automaticamente na primeira execução');
    return false;
  }
};

// Criar diretórios necessários
const createDirectories = () => {
  console.log('📁 Criando diretórios necessários...');
  
  const dirs = [
    'src/data',
    'public/assets/badges',
    'scripts'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Criado: ${dir}`);
    } else {
      console.log(`📁 Já existe: ${dir}`);
    }
  });
};

// Criar arquivo de configuração
const createConfig = () => {
  console.log('⚙️  Criando arquivo de configuração...');
  
  const config = {
    lastCheck: null,
    autoUpdate: true,
    checkInterval: 24, // horas
    logLevel: 'info',
    backupEnabled: true,
    maxBackups: 7
  };
  
  const configPath = path.join(__dirname, '../.badge-monitor-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Arquivo de configuração criado');
};

// Criar script de backup
const createBackupScript = () => {
  console.log('💾 Criando script de backup...');
  
  const backupScript = `const fs = require('fs');
const path = require('path');

const backupData = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const files = [
    'src/data/badge-codes.json',
    'src/data/badge-categories.json'
  ];
  
  files.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file);
    if (fs.existsSync(sourcePath)) {
      const backupPath = path.join(backupDir, \`\${path.basename(file)}.\${timestamp}\`);
      fs.copyFileSync(sourcePath, backupPath);
      console.log(\`Backup criado: \${backupPath}\`);
    }
  });
  
  // Limpar backups antigos (manter apenas os últimos 7)
  const backupFiles = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .reverse();
    
  if (backupFiles.length > 7) {
    backupFiles.slice(7).forEach(file => {
      fs.unlinkSync(path.join(backupDir, file));
      console.log(\`Backup antigo removido: \${file}\`);
    });
  }
};

if (require.main === module) {
  backupData();
}

module.exports = { backupData };`;

  const backupPath = path.join(__dirname, 'backup-badge-data.cjs');
  fs.writeFileSync(backupPath, backupScript);
  console.log('✅ Script de backup criado');
};

// Criar README com instruções
const createReadme = () => {
  console.log('📖 Criando documentação...');
  
  const readme = `# Monitoramento Automático de Badges

Este sistema verifica automaticamente novos badges do Habbo Hotel diariamente.

## Como usar

### 1. Configuração Inicial
\`\`\`bash
node scripts/setup-badge-monitoring.cjs
\`\`\`

### 2. Execução Manual
\`\`\`bash
node scripts/check-new-badges.cjs
\`\`\`

### 3. Agendamento no Windows
\`\`\`powershell
# Executar como Administrador
.\\scripts\\agendar-verificacao-badges.ps1 -CriarTarefa
\`\`\`

### 4. Executar Agora
\`\`\`powershell
.\\scripts\\agendar-verificacao-badges.ps1 -ExecutarAgora
\`\`\`

## Arquivos Criados

- \`src/data/badge-codes.json\` - Lista de códigos de badges
- \`src/data/badge-categories.json\` - Categorias de badges
- \`public/assets/badges/\` - Imagens dos badges
- \`badge-update.log\` - Log de atualizações
- \`.last-badge-check\` - Timestamp da última verificação

## Logs

Os logs são salvos em \`badge-update.log\` com timestamp de cada operação.

## Backup

O sistema cria backups automáticos dos arquivos de dados em \`backups/\`.

## Troubleshooting

Se houver problemas:
1. Verifique os logs em \`badge-update.log\`
2. Execute manualmente: \`node scripts/check-new-badges.cjs\`
3. Verifique se o \`habbo-downloader\` está funcionando
`;

  const readmePath = path.join(__dirname, '../BADGE-MONITORING.md');
  fs.writeFileSync(readmePath, readme);
  console.log('✅ Documentação criada');
};

// Função principal
const main = async () => {
  try {
    await checkHabboDownloader();
    createDirectories();
    createConfig();
    createBackupScript();
    createReadme();
    
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: node scripts/check-new-badges.cjs (para testar)');
    console.log('2. Configure o agendamento no Windows se desejar');
    console.log('3. Monitore os logs em badge-update.log');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
  }
};

if (require.main === module) {
  main();
}

module.exports = { main };
