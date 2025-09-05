const fs = require('fs');
const path = require('path');
const https = require('https');

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
    
    // Verificar se passou mais de 7 dias (verificação semanal)
    const daysDiff = (now - lastCheckDate) / (1000 * 60 * 60 * 24);
    return daysDiff >= 7;
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

// Função para fazer requisição HTTPS
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Erro ao parsear JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

// Função para buscar badges da API
const fetchBadgesFromAPI = async () => {
  try {
    log('Buscando badges da API HabboAssets...');
    
    const url = 'https://www.habboassets.com/api/v1/badges?limit=2000';
    const data = await makeRequest(url);
    
    if (data && data.badges && Array.isArray(data.badges)) {
      log(`Encontrados ${data.badges.length} badges na API`);
      return data.badges;
    } else {
      throw new Error('Resposta da API inválida');
    }
  } catch (error) {
    log(`Erro ao buscar badges da API: ${error.message}`);
    return [];
  }
};

// Função para processar badges da API
const processBadgesFromAPI = (apiBadges) => {
  try {
    if (!apiBadges || apiBadges.length === 0) {
      log('Nenhum badge encontrado na API');
      return false;
    }
    
    // Extrair códigos dos badges
    const newBadgeCodes = apiBadges.map(badge => badge.code).filter(code => code);
    
    log(`Processando ${newBadgeCodes.length} códigos de badges`);
    
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
    
    log(`Encontrados ${newCodes.length} novos badges: ${newCodes.slice(0, 10).join(', ')}${newCodes.length > 10 ? '...' : ''}`);
    
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
    
    // Criar arquivo de informações completas dos badges
    const badgeInfo = {};
    apiBadges.forEach(badge => {
      badgeInfo[badge.code] = {
        name: badge.name || badge.code,
        description: badge.description || `Emblema ${badge.code}`,
        hotel: badge.hotel || 'com',
        imageUrl: badge.imageUrl || `https://www.habboassets.com/api/v1/badges/${badge.code}/image`,
        createdAt: badge.created_at,
        updatedAt: badge.updated_at
      };
    });
    
    const badgeInfoFile = path.join(__dirname, '../src/data/full-badge-info.json');
    fs.writeFileSync(badgeInfoFile, JSON.stringify(badgeInfo, null, 2));
    
    log(`Atualização concluída: ${newCodes.length} novos badges adicionados`);
    log(`Arquivo de informações criado: ${badgeInfoFile}`);
    
    return true;
    
  } catch (error) {
    log(`Erro ao processar badges da API: ${error.message}`);
    return false;
  }
};

// Função principal
const main = async () => {
  try {
    log('=== Iniciando verificação de novos badges via API ===');
    
    // Verificar se precisa atualizar
    if (!shouldUpdate()) {
      log('Verificação não necessária (menos de 24h desde última verificação)');
      return;
    }
    
    // Buscar badges da API
    const apiBadges = await fetchBadgesFromAPI();
    if (apiBadges.length === 0) {
      log('Falha ao buscar badges da API');
      return;
    }
    
    // Processar badges da API
    const processingSuccess = processBadgesFromAPI(apiBadges);
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

module.exports = { main, shouldUpdate, fetchBadgesFromAPI, processBadgesFromAPI };
