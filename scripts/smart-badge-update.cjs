const fs = require('fs');
const path = require('path');
const https = require('https');

// Caminhos dos arquivos
const BADGE_CODES_FILE = path.join(__dirname, '../src/data/badge-codes.json');
const BADGE_CATEGORIES_FILE = path.join(__dirname, '../src/data/badge-categories.json');
const FULL_BADGE_INFO_FILE = path.join(__dirname, '../src/data/full-badge-info.json');
const LAST_CHECK_FILE = path.join(__dirname, '../.last-badge-check');
const LOG_FILE = path.join(__dirname, '../badge-update.log');

// Função para log
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
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

// Função para buscar badges da API com paginação
const fetchAllBadgesFromAPI = async () => {
  try {
    log('Buscando todos os badges da API HabboAssets...');
    
    const allBadges = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const url = `https://www.habboassets.com/api/v1/badges?limit=${limit}&offset=${offset}&order=desc`;
      log(`Buscando badges ${offset + 1}-${offset + limit}...`);
      
      const data = await makeRequest(url);
      
      if (data && data.badges && Array.isArray(data.badges)) {
        allBadges.push(...data.badges);
        
        // Se retornou menos badges que o limite, chegamos ao fim
        if (data.badges.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      } else {
        hasMore = false;
      }
    }
    
    log(`Total de badges encontrados: ${allBadges.length}`);
    return allBadges;
    
  } catch (error) {
    log(`Erro ao buscar badges da API: ${error.message}`);
    return [];
  }
};

// Função para determinar badges realmente novos
const findNewBadges = (apiBadges, existingBadgeInfo) => {
  try {
    if (!apiBadges || apiBadges.length === 0) {
      return [];
    }
    
    // Encontrar a data mais recente dos badges existentes
    let latestExistingDate = null;
    if (existingBadgeInfo && Object.keys(existingBadgeInfo).length > 0) {
      const existingDates = Object.values(existingBadgeInfo)
        .map(badge => badge.createdAt ? new Date(badge.createdAt) : null)
        .filter(date => date !== null);
      
      if (existingDates.length > 0) {
        latestExistingDate = new Date(Math.max(...existingDates.map(d => d.getTime())));
      }
    }
    
    log(`Data mais recente dos badges existentes: ${latestExistingDate ? latestExistingDate.toISOString() : 'Nenhuma'}`);
    
    // Filtrar badges criados após a data mais recente
    const newBadges = apiBadges.filter(badge => {
      if (!badge.created_at) return false;
      
      const badgeDate = new Date(badge.created_at);
      
      // Se não temos data de referência, considerar todos como novos na primeira execução
      if (!latestExistingDate) return true;
      
      return badgeDate > latestExistingDate;
    });
    
    log(`Badges realmente novos encontrados: ${newBadges.length}`);
    
    if (newBadges.length > 0) {
      const newestBadge = newBadges[0];
      const oldestNewBadge = newBadges[newBadges.length - 1];
      log(`Badge mais novo: ${newestBadge.code} (${newestBadge.created_at})`);
      log(`Badge mais antigo dos novos: ${oldestNewBadge.code} (${oldestNewBadge.created_at})`);
    }
    
    return newBadges;
    
  } catch (error) {
    log(`Erro ao encontrar badges novos: ${error.message}`);
    return [];
  }
};

// Função para processar badges novos
const processNewBadges = (newBadges, existingBadgeInfo = {}) => {
  try {
    if (!newBadges || newBadges.length === 0) {
      log('Nenhum badge novo para processar');
      return false;
    }
    
    // Extrair códigos dos badges novos
    const newBadgeCodes = newBadges.map(badge => badge.code).filter(code => code);
    
    // Carregar códigos existentes
    let existingCodes = [];
    if (fs.existsSync(BADGE_CODES_FILE)) {
      existingCodes = JSON.parse(fs.readFileSync(BADGE_CODES_FILE, 'utf8'));
    }
    
    // Adicionar novos códigos
    const updatedCodes = [...new Set([...existingCodes, ...newBadgeCodes])].sort();
    fs.writeFileSync(BADGE_CODES_FILE, JSON.stringify(updatedCodes, null, 2));
    
    // Atualizar categorias
    let categories = { 'all': [] };
    if (fs.existsSync(BADGE_CATEGORIES_FILE)) {
      categories = JSON.parse(fs.readFileSync(BADGE_CATEGORIES_FILE, 'utf8'));
    }
    
    // Garantir que categories.all é um array
    if (!Array.isArray(categories.all)) {
      categories.all = [];
    }
    
    categories.all = [...new Set([...categories.all, ...newBadgeCodes])].sort();
    fs.writeFileSync(BADGE_CATEGORIES_FILE, JSON.stringify(categories, null, 2));
    
    // Atualizar informações completas dos badges
    const updatedBadgeInfo = { ...existingBadgeInfo };
    newBadges.forEach(badge => {
      updatedBadgeInfo[badge.code] = {
        name: badge.name || badge.code,
        description: badge.description || `Emblema ${badge.code}`,
        hotel: badge.hotel || 'com',
        imageUrl: badge.imageUrl || `https://www.habboassets.com/api/v1/badges/${badge.code}/image`,
        createdAt: badge.created_at,
        updatedAt: badge.updated_at
      };
    });
    
    fs.writeFileSync(FULL_BADGE_INFO_FILE, JSON.stringify(updatedBadgeInfo, null, 2));
    
    log(`Processamento concluído: ${newBadgeCodes.length} novos badges adicionados`);
    return true;
    
  } catch (error) {
    log(`Erro ao processar badges novos: ${error.message}`);
    return false;
  }
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

// Função principal
const main = async () => {
  try {
    log('=== Iniciando verificação inteligente de novos badges ===');
    
    // Verificar se precisa atualizar
    if (!shouldUpdate()) {
      log('Verificação não necessária (menos de 7 dias desde última verificação)');
      return;
    }
    
    // Carregar informações existentes
    let existingBadgeInfo = {};
    if (fs.existsSync(FULL_BADGE_INFO_FILE)) {
      existingBadgeInfo = JSON.parse(fs.readFileSync(FULL_BADGE_INFO_FILE, 'utf8'));
    }
    
    // Buscar todos os badges da API
    const allApiBadges = await fetchAllBadgesFromAPI();
    if (allApiBadges.length === 0) {
      log('Falha ao buscar badges da API');
      return;
    }
    
    // Encontrar badges realmente novos
    const newBadges = findNewBadges(allApiBadges, existingBadgeInfo);
    
    // Processar apenas badges novos
    const processingSuccess = processNewBadges(newBadges, existingBadgeInfo);
    if (!processingSuccess) {
      log('Falha no processamento de badges');
      return;
    }
    
    // Atualizar timestamp
    updateLastCheck();
    
    log('=== Verificação inteligente de badges concluída com sucesso ===');
    
  } catch (error) {
    log(`Erro geral: ${error.message}`);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, shouldUpdate, fetchAllBadgesFromAPI, findNewBadges, processNewBadges };
