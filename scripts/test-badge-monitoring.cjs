const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🧪 Testando sistema de monitoramento de badges...\n');

// Testar se os arquivos necessários existem
const testFiles = () => {
  console.log('📁 Verificando arquivos necessários...');
  
  const requiredFiles = [
    'src/data/badge-codes.json',
    'src/data/badge-categories.json'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - FALTANDO`);
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log('\n⚠️  Alguns arquivos estão faltando. Execute primeiro:');
    console.log('   node scripts/setup-badge-monitoring.cjs');
    return false;
  }
  
  return true;
};

// Testar se o habbo-downloader funciona
const testHabboDownloader = async () => {
  console.log('\n📦 Testando habbo-downloader...');
  
  try {
    const { stdout } = await execAsync('npx habbo-downloader@latest --version', { timeout: 30000 });
    console.log('✅ habbo-downloader funcionando');
    console.log(`   Versão: ${stdout.trim()}`);
    return true;
  } catch (error) {
    console.log('❌ habbo-downloader não está funcionando');
    console.log(`   Erro: ${error.message}`);
    return false;
  }
};

// Testar extração de badges
const testBadgeExtraction = async () => {
  console.log('\n🔍 Testando extração de badges...');
  
  try {
    // Criar diretório temporário para teste
    const testDir = path.join(__dirname, 'test-extraction');
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir);
    
    // Tentar extrair alguns badges
    const command = `npx habbo-downloader@latest badges --output "${testDir}" --limit 5`;
    console.log(`   Executando: ${command}`);
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 60000,
      cwd: __dirname 
    });
    
    if (stderr) {
      console.log(`   Stderr: ${stderr}`);
    }
    
    // Verificar se arquivos foram criados
    const files = fs.readdirSync(testDir);
    const badgeFiles = files.filter(file => file.endsWith('.gif'));
    
    if (badgeFiles.length > 0) {
      console.log(`✅ Extração funcionando - ${badgeFiles.length} badges extraídos`);
      console.log(`   Arquivos: ${badgeFiles.join(', ')}`);
    } else {
      console.log('⚠️  Nenhum arquivo de badge foi extraído');
    }
    
    // Limpar diretório de teste
    fs.rmSync(testDir, { recursive: true });
    
    return badgeFiles.length > 0;
    
  } catch (error) {
    console.log('❌ Erro na extração de badges');
    console.log(`   Erro: ${error.message}`);
    return false;
  }
};

// Testar script principal
const testMainScript = async () => {
  console.log('\n🚀 Testando script principal...');
  
  try {
    const scriptPath = path.join(__dirname, 'check-new-badges.cjs');
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, { 
      timeout: 120000,
      cwd: __dirname 
    });
    
    if (stderr) {
      console.log(`   Stderr: ${stderr}`);
    }
    
    console.log('✅ Script principal executado com sucesso');
    return true;
    
  } catch (error) {
    console.log('❌ Erro no script principal');
    console.log(`   Erro: ${error.message}`);
    return false;
  }
};

// Verificar logs
const checkLogs = () => {
  console.log('\n📋 Verificando logs...');
  
  const logFile = path.join(__dirname, '../badge-update.log');
  if (fs.existsSync(logFile)) {
    const logContent = fs.readFileSync(logFile, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    console.log(`✅ Log encontrado - ${lines.length} entradas`);
    
    // Mostrar últimas 5 linhas
    const lastLines = lines.slice(-5);
    console.log('   Últimas entradas:');
    lastLines.forEach(line => {
      console.log(`   ${line}`);
    });
  } else {
    console.log('⚠️  Arquivo de log não encontrado');
  }
};

// Função principal de teste
const main = async () => {
  try {
    const results = {
      files: testFiles(),
      habboDownloader: false,
      extraction: false,
      mainScript: false
    };
    
    if (results.files) {
      results.habboDownloader = await testHabboDownloader();
      
      if (results.habboDownloader) {
        results.extraction = await testBadgeExtraction();
        results.mainScript = await testMainScript();
      }
    }
    
    checkLogs();
    
    console.log('\n📊 Resumo dos Testes:');
    console.log(`   Arquivos: ${results.files ? '✅' : '❌'}`);
    console.log(`   habbo-downloader: ${results.habboDownloader ? '✅' : '❌'}`);
    console.log(`   Extração: ${results.extraction ? '✅' : '❌'}`);
    console.log(`   Script principal: ${results.mainScript ? '✅' : '❌'}`);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.log('\n🎉 Todos os testes passaram! O sistema está funcionando.');
    } else {
      console.log('\n⚠️  Alguns testes falharam. Verifique os erros acima.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }
};

if (require.main === module) {
  main();
}

module.exports = { main };
