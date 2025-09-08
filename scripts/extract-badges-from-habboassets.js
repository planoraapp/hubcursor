import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Extraindo emblemas da API oficial do HabboAssets...');

// Lista de hotéis para buscar
const HOTELS = ['com', 'com.br', 'com.tr', 'it', 'nl', 'es', 'fi', 'de', 'fr'];

// Função para buscar emblemas de um hotel específico
async function fetchBadgesFromHotel(hotel, limit = 2000, offset = 0) {
  try {
    console.log(`📥 Buscando emblemas do hotel: ${hotel} (offset: ${offset})`);
    
    const url = `https://www.habboassets.com/api/v1/badges?hotel=${hotel}&limit=${limit}&offset=${offset}&order=asc`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const badges = data.badges || [];
    console.log(`✅ ${hotel}: ${badges.length} emblemas encontrados`);
    
    return badges;
  } catch (error) {
    console.error(`❌ Erro ao buscar emblemas do hotel ${hotel}:`, error.message);
    return [];
  }
}

// Função para buscar todos os emblemas de todos os hotéis
async function fetchAllBadges() {
  const allBadges = new Map();
  let totalBadges = 0;

  for (const hotel of HOTELS) {
    try {
      console.log(`\n🏨 Processando hotel: ${hotel}`);
      
      let offset = 0;
      let hasMore = true;
      let hotelBadges = 0;

      while (hasMore) {
        const badges = await fetchBadgesFromHotel(hotel, 2000, offset);
        
        if (badges.length === 0) {
          hasMore = false;
        } else {
          badges.forEach(badge => {
            if (badge.code) {
              // Usar o código como chave única
              const key = `${badge.code}_${hotel}`;
              allBadges.set(key, {
                code: badge.code,
                name: badge.name || badge.code,
                description: badge.description || `Emblema ${badge.code}`,
                hotel: hotel,
                imageUrl: badge.url_habboassets || badge.url_habbo || null
              });
              hotelBadges++;
            }
          });
          
          offset += badges.length;
          totalBadges += badges.length;
          
          // Se retornou menos que o limite, não há mais páginas
          if (badges.length < 2000) {
            hasMore = false;
          }
          
          // Pausa entre requisições
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`✅ ${hotel}: ${hotelBadges} emblemas únicos`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar hotel ${hotel}:`, error.message);
    }
  }

  console.log(`\n📊 Resumo geral:`);
  console.log(`🏆 Total de emblemas coletados: ${totalBadges}`);
  console.log(`🔑 Emblemas únicos: ${allBadges.size}`);

  return allBadges;
}

// Função para processar e salvar os dados
async function processAndSaveBadges(allBadges) {
  console.log('\n💾 Processando e salvando dados...');

  // Converter Map para objetos
  const badgeDescriptions = {};
  const fullBadgeInfo = {};
  const badgeByHotel = {};

  allBadges.forEach((badge, key) => {
    const { code, name, description, hotel, imageUrl } = badge;
    
    // Descrições (usar a primeira descrição encontrada para cada código)
    if (!badgeDescriptions[code]) {
      badgeDescriptions[code] = description;
    }
    
    // Informações completas
    if (!fullBadgeInfo[code]) {
      fullBadgeInfo[code] = {
        name: name,
        description: description,
        code: code,
        imageUrl: imageUrl,
        hotels: []
      };
    }
    
    // Adicionar hotel à lista
    if (!fullBadgeInfo[code].hotels.includes(hotel)) {
      fullBadgeInfo[code].hotels.push(hotel);
    }
    
    // Agrupar por hotel
    if (!badgeByHotel[hotel]) {
      badgeByHotel[hotel] = [];
    }
    badgeByHotel[hotel].push({
      code: code,
      name: name,
      description: description,
      imageUrl: imageUrl
    });
  });

  // Salvar descrições
  const descriptionsFile = path.join(__dirname, '..', 'src', 'data', 'real-badge-descriptions.json');
  fs.writeFileSync(descriptionsFile, JSON.stringify(badgeDescriptions, null, 2));
  console.log(`💾 Descrições salvas em: ${descriptionsFile}`);

  // Salvar informações completas
  const fullInfoFile = path.join(__dirname, '..', 'src', 'data', 'full-badge-info.json');
  fs.writeFileSync(fullInfoFile, JSON.stringify(fullBadgeInfo, null, 2));
  console.log(`💾 Informações completas salvas em: ${fullInfoFile}`);

  // Salvar por hotel
  const byHotelFile = path.join(__dirname, '..', 'src', 'data', 'badges-by-hotel.json');
  fs.writeFileSync(byHotelFile, JSON.stringify(badgeByHotel, null, 2));
  console.log(`💾 Emblemas por hotel salvos em: ${byHotelFile}`);

  // Mostrar estatísticas por hotel
  console.log('\n📊 Emblemas por hotel:');
  Object.entries(badgeByHotel).forEach(([hotel, badges]) => {
    console.log(`  ${hotel}: ${badges.length} emblemas`);
  });

  // Mostrar alguns exemplos
  const examples = Object.entries(badgeDescriptions).slice(0, 15);
  console.log('\n📋 Exemplos de descrições encontradas:');
  examples.forEach(([code, description]) => {
    console.log(`  ${code}: ${description}`);
  });

  return {
    descriptions: badgeDescriptions,
    fullInfo: fullBadgeInfo,
    byHotel: badgeByHotel
  };
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando extração de emblemas...\n');
    
    // Buscar todos os emblemas
    const allBadges = await fetchAllBadges();
    
    if (allBadges.size === 0) {
      console.log('❌ Nenhum emblema encontrado');
      return;
    }
    
    // Processar e salvar
    const results = await processAndSaveBadges(allBadges);
    
    console.log('\n✅ Extração concluída com sucesso!');
    console.log(`📈 Total de emblemas únicos: ${Object.keys(results.descriptions).length}`);
    
  } catch (error) {
    console.error('❌ Erro durante a extração:', error);
    process.exit(1);
  }
}

main();
