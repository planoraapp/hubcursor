const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Caminhos dos arquivos
const BADGE_CODES_FILE = path.join(__dirname, '../src/data/badge-codes.json');
const BADGE_CATEGORIES_FILE = path.join(__dirname, '../src/data/badge-categories.json');
const LAST_CHECK_FILE = path.join(__dirname, '../.last-badge-check');
const LOG_FILE = path.join(__dirname, '../badge-update.log');

// Função para log
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
};

// Função para verificar se precisa atualizar
const shouldUpdate = () => {
  try {
    if (!fs.existsSync(LAST_CHECK_FILE)) {
      return true;
    }
    
    const lastCheck = fs.readFileSync(LAST_CHECK_FILE, 'utf8');
    const lastCheckDate = new Date(lastCheck);
    const now = new Date();
    
    // Verificar se passou mais de 24 horas
    const hoursDiff = (now - lastCheckDate) / (1000 * 60 * 60);
    return hoursDiff >= 24;
  } catch (error) {
    log(`Erro ao verificar última atualização: ${error.message}`);
    return true;
  }
};

// Função para atualizar timestamp
const updateLastCheck = () => {
  try {
    fs.writeFileSync(LAST_CHECK_FILE, new Date().toISOString());
    log('Timestamp de última verificação atualizado');
  } catch (error) {
    log(`Erro ao atualizar timestamp: ${error.message}`);
  }
};

// Função para extrair badges usando habbo-downloader
const extractBadges = async () => {
  try {
    log('Iniciando extração de badges com habbo-downloader...');
    
    // Comando para extrair badges
    const command = 'npx habbo-downloader@latest badges --output ./temp-badges --limit 100';
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: __dirname,
      timeout: 300000 // 5 minutos timeout
    });
    
    if (stderr) {
      log(`Stderr: ${stderr}`);
    }
    
    log(`Stdout: ${stdout}`);
    return true;
  } catch (error) {
    log(`Erro ao extrair badges: ${error.message}`);
    return false;
  }
};

// Função para processar badges extraídos
const processExtractedBadges = () => {
  try {
    const tempDir = path.join(__dirname, 'temp-badges');
    
    if (!fs.existsSync(tempDir)) {
      log('Diretório temp-badges não encontrado');
      return false;
    }
    
    // Listar arquivos de badges
    const files = fs.readdirSync(tempDir);
    const badgeFiles = files.filter(file => file.endsWith('.gif'));
    
    log(`Encontrados ${badgeFiles.length} arquivos de badges`);
    
    if (badgeFiles.length === 0) {
      log('Nenhum arquivo de badge encontrado');
      return false;
    }
    
    // Extrair códigos dos nomes dos arquivos
    const newBadgeCodes = badgeFiles.map(file => {
      // Remover extensão .gif
      return file.replace('.gif', '');
    });
    
    // Carregar códigos existentes
    let existingCodes = [];
    if (fs.existsSync(BADGE_CODES_FILE)) {
      existingCodes = JSON.parse(fs.readFileSync(BADGE_CODES_FILE, 'utf8'));
    }
    
    // Encontrar novos códigos
    const newCodes = newBadgeCodes.filter(code => !existingCodes.includes(code));
    
    if (newCodes.length === 0) {
      log('Nenhum novo badge encontrado');
      return false;
    }
    
    log(`Encontrados ${newCodes.length} novos badges: ${newCodes.join(', ')}`);
    
    // Atualizar lista de códigos
    const updatedCodes = [...existingCodes, ...newCodes].sort();
    fs.writeFileSync(BADGE_CODES_FILE, JSON.stringify(updatedCodes, null, 2));
    
    // Atualizar categorias (adicionar novos badges na categoria 'all')
    let categories = { 'all': [] };
    if (fs.existsSync(BADGE_CATEGORIES_FILE)) {
      categories = JSON.parse(fs.readFileSync(BADGE_CATEGORIES_FILE, 'utf8'));
    }
    
    // Adicionar novos códigos na categoria 'all'
    categories.all = [...new Set([...categories.all, ...newCodes])].sort();
    fs.writeFileSync(BADGE_CATEGORIES_FILE, JSON.stringify(categories, null, 2));
    
    // Copiar arquivos de imagem para o diretório público
    const publicBadgesDir = path.join(__dirname, '../public/assets/badges');
    if (!fs.existsSync(publicBadgesDir)) {
      fs.mkdirSync(publicBadgesDir, { recursive: true });
    }
    
    newCodes.forEach(code => {
      const sourceFile = path.join(tempDir, `${code}.gif`);
      const destFile = path.join(publicBadgesDir, `${code}.gif`);
      
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, destFile);
        log(`Copiado ${code}.gif para assets/badges/`);
      }
    });
    
    // Limpar diretório temporário
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    log(`Atualização concluída: ${newCodes.length} novos badges adicionados`);
    return true;
    
  } catch (error) {
    log(`Erro ao processar badges extraídos: ${error.message}`);
    return false;
  }
};

// Função principal
const main = async () => {
  try {
    log('=== Iniciando verificação de novos badges ===');
    
    // Verificar se precisa atualizar
    if (!shouldUpdate()) {
      log('Verificação não necessária (menos de 24h desde última verificação)');
      return;
    }
    
    // Extrair badges
    const extractionSuccess = await extractBadges();
    if (!extractionSuccess) {
      log('Falha na extração de badges');
      return;
    }
    
    // Processar badges extraídos
    const processingSuccess = processExtractedBadges();
    if (!processingSuccess) {
      log('Falha no processamento de badges');
      return;
    }
    
    // Atualizar timestamp
    updateLastCheck();
    
    log('=== Verificação de badges concluída com sucesso ===');
    
  } catch (error) {
    log(`Erro geral: ${error.message}`);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, shouldUpdate, extractBadges, processExtractedBadges };
