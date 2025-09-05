#!/usr/bin/env node

/**
 * Sistema de verificação diária de novos emblemas
 * Compara com a API HabboAssets e atualiza o banco de dados
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon-key')) {
  var supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('❌ Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY');
  process.exit(1);
}

// Configuração da API
const HABBO_ASSETS_API = 'https://www.habboassets.com/api/v1/badges';
const LOG_FILE = path.join(__dirname, '../logs/badge-updates.log');

// Funções auxiliares (mesmas do script de população)
const getCountryFromCode = (code) => {
  const countryMap = {
    'BR': 'Brasil/Portugal', 'PT': 'Brasil/Portugal', 'ES': 'Espanha', 'FR': 'França', 'DE': 'Alemanha', 
    'IT': 'Itália', 'NL': 'Holanda', 'TR': 'Turquia', 'FI': 'Finlândia', 
    'US': 'Estados Unidos', 'UK': 'Reino Unido'
  };
  
  for (const [prefix, country] of Object.entries(countryMap)) {
    if (code.startsWith(prefix)) {
      return country;
    }
  }
  return 'Outros';
};

const getSpecialCategory = (code, description = '') => {
  const desc = description.toLowerCase();
  
  if (code.includes('ADM') || code.includes('MOD') || code.includes('STAFF') || 
      code.includes('HC') || code.includes('HIT') || code.includes('HLA') ||
      code.includes('HLIVE') || code.includes('COMSN') ||
      desc.includes('staff') || desc.includes('administrator') ||
      desc.includes('moderator') || desc.includes('habbo club') ||
      desc.includes('habbo live')) {
    return 'Staff';
  }
  
  if (code.startsWith('ACH_') || 
      desc.includes('achievement') || desc.includes('conquista') ||
      desc.includes('for being') || desc.includes('for having') ||
      desc.includes('for completing') || desc.includes('for purchasing') ||
      desc.includes('for participating') || desc.includes('for winning') ||
      desc.includes('for collecting') || desc.includes('for trading') ||
      desc.includes('for building') || desc.includes('for creating')) {
    return 'Achievements';
  }
  
  if (code.includes('FBC') || code.includes('COM') || code.includes('FAN') ||
      code.includes('WUP') || code.includes('HWS') || code.includes('NY') ||
      code.includes('HWN') || code.includes('VAL') || code.includes('EAST') ||
      desc.includes('facebook') || desc.includes('fansite') ||
      desc.includes('community') || desc.includes('group') ||
      desc.includes('competition') || desc.includes('winner') ||
      desc.includes('wake up party') || desc.includes('winter special') ||
      desc.includes('halloween') || desc.includes('valentine') ||
      desc.includes('easter') || desc.includes('new year') ||
      desc.includes('christmas') || desc.includes('xmas')) {
    return 'Fã-Sites';
  }
  
  return 'Outros';
};

const getHotelFromCode = (code) => {
  const hotelMap = {
    'BR': 'com.br', 'PT': 'com.br', 'ES': 'es', 'FR': 'fr', 'DE': 'de', 
    'IT': 'it', 'NL': 'nl', 'TR': 'com.tr', 'FI': 'fi', 
    'US': 'com', 'UK': 'com'
  };
  
  for (const [prefix, hotel] of Object.entries(hotelMap)) {
    if (code.startsWith(prefix)) {
      return hotel;
    }
  }
  return 'com';
};

// Função para log
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // Criar diretório de logs se não existir
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(LOG_FILE, logMessage);
};

// Função para buscar todos os badges da API
async function fetchAllBadgesFromAPI() {
  try {
    log('🔍 Buscando badges da API HabboAssets...');
    
    const allBadges = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const url = `${HABBO_ASSETS_API}?limit=${limit}&offset=${offset}&order=desc`;
      log(`📡 Fazendo requisição: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const badges = data.badges || [];
      
      if (badges.length === 0) {
        hasMore = false;
      } else {
        allBadges.push(...badges);
        offset += limit;
        log(`✅ Recebidos ${badges.length} badges (total: ${allBadges.length})`);
      }
      
      // Pequena pausa para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    log(`🎯 Total de badges encontrados na API: ${allBadges.length}`);
    return allBadges;
    
  } catch (error) {
    log(`❌ Erro ao buscar badges da API: ${error.message}`);
    throw error;
  }
}

// Função para buscar badges existentes no banco
async function getExistingBadges() {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('code, updated_at');
    
    if (error) {
      throw error;
    }
    
    const badgeMap = {};
    data.forEach(badge => {
      badgeMap[badge.code] = badge.updated_at;
    });
    
    log(`📊 Badges existentes no banco: ${Object.keys(badgeMap).length}`);
    return badgeMap;
    
  } catch (error) {
    log(`❌ Erro ao buscar badges existentes: ${error.message}`);
    throw error;
  }
}

// Função para inserir novo badge
async function insertNewBadge(badgeData) {
  try {
    const { data: insertedBadge, error: badgeError } = await supabase
      .from('badges')
      .insert([{
        code: badgeData.code,
        name: badgeData.name || badgeData.code,
        description: badgeData.description || '',
        hotel: getHotelFromCode(badgeData.code),
        image_url: badgeData.imageUrl || `/badges/c_images/album1584/${badgeData.code}.gif`,
        created_at: badgeData.createdAt ? new Date(badgeData.createdAt).toISOString() : null,
        updated_at: badgeData.updatedAt ? new Date(badgeData.updatedAt).toISOString() : null,
        is_active: true
      }])
      .select('id, code')
      .single();
    
    if (badgeError) {
      throw badgeError;
    }
    
    // Inserir categorias
    const categories = ['all'];
    const specialCategory = getSpecialCategory(badgeData.code, badgeData.description || '');
    if (specialCategory !== 'Outros') {
      categories.push(specialCategory);
    }
    
    const categoryInserts = categories.map(category => ({
      badge_id: insertedBadge.id,
      category: category
    }));
    
    await supabase
      .from('badge_categories')
      .insert(categoryInserts);
    
    // Inserir país
    const country = getCountryFromCode(badgeData.code);
    await supabase
      .from('badge_countries')
      .insert([{
        badge_id: insertedBadge.id,
        country: country
      }]);
    
    return insertedBadge;
    
  } catch (error) {
    log(`❌ Erro ao inserir badge ${badgeData.code}: ${error.message}`);
    throw error;
  }
}

// Função para atualizar badge existente
async function updateExistingBadge(code, badgeData) {
  try {
    const { error } = await supabase
      .from('badges')
      .update({
        name: badgeData.name || code,
        description: badgeData.description || '',
        image_url: badgeData.imageUrl || `/badges/c_images/album1584/${code}.gif`,
        updated_at: badgeData.updatedAt ? new Date(badgeData.updatedAt).toISOString() : new Date().toISOString()
      })
      .eq('code', code);
    
    if (error) {
      throw error;
    }
    
    log(`🔄 Badge ${code} atualizado`);
    
  } catch (error) {
    log(`❌ Erro ao atualizar badge ${code}: ${error.message}`);
    throw error;
  }
}

// Função principal de verificação
async function checkForNewBadges() {
  try {
    log('🚀 Iniciando verificação diária de badges...');
    
    // Buscar badges da API
    const apiBadges = await fetchAllBadgesFromAPI();
    
    // Buscar badges existentes no banco
    const existingBadges = await getExistingBadges();
    
    // Identificar novos e atualizados
    const newBadges = [];
    const updatedBadges = [];
    
    for (const apiBadge of apiBadges) {
      const code = apiBadge.code;
      const existingBadge = existingBadges[code];
      
      if (!existingBadge) {
        // Novo badge
        newBadges.push(apiBadge);
      } else {
        // Verificar se precisa atualizar
        const apiUpdatedAt = apiBadge.updatedAt ? new Date(apiBadge.updatedAt) : null;
        const dbUpdatedAt = new Date(existingBadge);
        
        if (apiUpdatedAt && apiUpdatedAt > dbUpdatedAt) {
          updatedBadges.push(apiBadge);
        }
      }
    }
    
    log(`📈 Resultado da verificação:`);
    log(`  - Novos badges: ${newBadges.length}`);
    log(`  - Badges atualizados: ${updatedBadges.length}`);
    log(`  - Total na API: ${apiBadges.length}`);
    log(`  - Total no banco: ${Object.keys(existingBadges).length}`);
    
    // Inserir novos badges
    let insertedCount = 0;
    for (const badge of newBadges) {
      try {
        await insertNewBadge(badge);
        insertedCount++;
        log(`✅ Novo badge inserido: ${badge.code}`);
      } catch (error) {
        log(`❌ Falha ao inserir ${badge.code}: ${error.message}`);
      }
    }
    
    // Atualizar badges existentes
    let updatedCount = 0;
    for (const badge of updatedBadges) {
      try {
        await updateExistingBadge(badge.code, badge);
        updatedCount++;
      } catch (error) {
        log(`❌ Falha ao atualizar ${badge.code}: ${error.message}`);
      }
    }
    
    // Resumo final
    log(`🎉 Verificação concluída!`);
    log(`  - ${insertedCount} novos badges inseridos`);
    log(`  - ${updatedCount} badges atualizados`);
    
    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      newBadges: insertedCount,
      updatedBadges: updatedCount,
      totalApi: apiBadges.length,
      totalDb: Object.keys(existingBadges).length + insertedCount,
      newBadgeCodes: newBadges.map(b => b.code),
      updatedBadgeCodes: updatedBadges.map(b => b.code)
    };
    
    const reportFile = path.join(__dirname, '../logs/daily-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    return report;
    
  } catch (error) {
    log(`❌ Erro durante verificação: ${error.message}`);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkForNewBadges()
    .then(() => {
      log('✅ Script executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      log(`❌ Script falhou: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { checkForNewBadges };
