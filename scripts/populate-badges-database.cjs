#!/usr/bin/env node

/**
 * Script para popular o banco de dados com dados dos emblemas
 * Este script lê os arquivos JSON existentes e insere no Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon-key')) {
  const supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('❌ Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY');
  process.exit(1);
}

// Função para detectar país baseado no código
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

// Função para detectar categoria especial
const getSpecialCategory = (code, description = '') => {
  const desc = description.toLowerCase();
  
  // Staff
  if (code.includes('ADM') || code.includes('MOD') || code.includes('STAFF') || 
      code.includes('HC') || code.includes('HIT') || code.includes('HLA') ||
      code.includes('HLIVE') || code.includes('COMSN') ||
      desc.includes('staff') || desc.includes('administrator') ||
      desc.includes('moderator') || desc.includes('habbo club') ||
      desc.includes('habbo live')) {
    return 'Staff';
  }
  
  // Achievements
  if (code.startsWith('ACH_') || 
      desc.includes('achievement') || desc.includes('conquista') ||
      desc.includes('for being') || desc.includes('for having') ||
      desc.includes('for completing') || desc.includes('for purchasing') ||
      desc.includes('for participating') || desc.includes('for winning') ||
      desc.includes('for collecting') || desc.includes('for trading') ||
      desc.includes('for building') || desc.includes('for creating')) {
    return 'Achievements';
  }
  
  // Fã-Sites
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

// Função para detectar hotel baseado no código
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
  return 'com'; // Default
};

async function populateDatabase() {
  try {
    console.log('🚀 Iniciando população do banco de dados...');
    
    // Ler arquivos JSON
    const badgeCodes = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/badge-codes.json'), 'utf8'));
    const fullBadgeInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/full-badge-info.json'), 'utf8'));
    const realDescriptions = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/real-badge-descriptions.json'), 'utf8'));
    
    console.log(`📊 Encontrados ${badgeCodes.length} códigos de emblemas`);
    
    // Limpar tabelas existentes
    console.log('🧹 Limpando dados existentes...');
    await supabase.from('badge_countries').delete().neq('id', 0);
    await supabase.from('badge_categories').delete().neq('id', 0);
    await supabase.from('badges').delete().neq('id', 0);
    
    // Processar emblemas em lotes
    const BATCH_SIZE = 100;
    let processed = 0;
    let inserted = 0;
    
    for (let i = 0; i < badgeCodes.length; i += BATCH_SIZE) {
      const batch = badgeCodes.slice(i, i + BATCH_SIZE);
      const badgesToInsert = [];
      
      for (const code of batch) {
        const badgeInfo = fullBadgeInfo[code] || {};
        const description = realDescriptions[code] || badgeInfo.description || '';
        
        const badge = {
          code,
          name: badgeInfo.name || code,
          description: description,
          hotel: getHotelFromCode(code),
          image_url: badgeInfo.imageUrl || `/badges/c_images/album1584/${code}.gif`,
          created_at: badgeInfo.createdAt ? new Date(badgeInfo.createdAt).toISOString() : null,
          updated_at: badgeInfo.updatedAt ? new Date(badgeInfo.updatedAt).toISOString() : null,
          is_active: true
        };
        
        badgesToInsert.push(badge);
      }
      
      // Inserir lote de badges
      const { data: insertedBadges, error: badgeError } = await supabase
        .from('badges')
        .insert(badgesToInsert)
        .select('id, code');
      
      if (badgeError) {
        console.error('❌ Erro ao inserir badges:', badgeError);
        continue;
      }
      
      // Inserir categorias e países para cada badge
      const categoriesToInsert = [];
      const countriesToInsert = [];
      
      for (const badge of insertedBadges) {
        const code = badge.code;
        const badgeInfo = fullBadgeInfo[code] || {};
        const description = realDescriptions[code] || badgeInfo.description || '';
        
        // Categoria principal
        categoriesToInsert.push({
          badge_id: badge.id,
          category: 'all'
        });
        
        // Categoria especial
        const specialCategory = getSpecialCategory(code, description);
        if (specialCategory !== 'Outros') {
          categoriesToInsert.push({
            badge_id: badge.id,
            category: specialCategory
          });
        }
        
        // País
        const country = getCountryFromCode(code);
        countriesToInsert.push({
          badge_id: badge.id,
          country: country
        });
      }
      
      // Inserir categorias
      if (categoriesToInsert.length > 0) {
        const { error: categoryError } = await supabase
          .from('badge_categories')
          .insert(categoriesToInsert);
        
        if (categoryError) {
          console.error('❌ Erro ao inserir categorias:', categoryError);
        }
      }
      
      // Inserir países
      if (countriesToInsert.length > 0) {
        const { error: countryError } = await supabase
          .from('badge_countries')
          .insert(countriesToInsert);
        
        if (countryError) {
          console.error('❌ Erro ao inserir países:', countryError);
        }
      }
      
      processed += batch.length;
      inserted += insertedBadges.length;
      
      console.log(`✅ Processados ${processed}/${badgeCodes.length} emblemas (${inserted} inseridos)`);
    }
    
    console.log(`🎉 População concluída! ${inserted} emblemas inseridos no banco de dados.`);
    
    // Estatísticas finais
    const { data: stats } = await supabase
      .from('badges')
      .select('id', { count: 'exact' });
    
    const { data: categoryStats } = await supabase
      .from('badge_categories')
      .select('category', { count: 'exact' })
      .group('category');
    
    console.log('\n📊 Estatísticas:');
    console.log(`- Total de emblemas: ${stats?.length || 0}`);
    console.log('- Categorias:');
    categoryStats?.forEach(stat => {
      console.log(`  - ${stat.category}: ${stat.count} emblemas`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante a população:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase };
