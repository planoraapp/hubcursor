import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Buscando emblemas de múltiplos usuários conhecidos...');

// Lista de usuários conhecidos do Habbo
const KNOWN_USERS = [
  'Beebop',
  'Sulake',
  'Habbo',
  'Admin',
  'Moderator',
  'Staff',
  'Helper',
  'Guide',
  'Builder',
  'Artist'
];

// Função para buscar uniqueId de um usuário
async function findUserUniqueId(username) {
  try {
    const response = await fetch(`https://www.habbo.com/api/public/users?name=${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.uniqueId) {
        return data.uniqueId;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Função para buscar emblemas de um usuário
async function fetchUserBadges(uniqueId) {
  try {
    const response = await fetch(`https://www.habbo.com/api/public/users/${uniqueId}/badges`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return [];
    }

    const badges = await response.json();
    return badges;
  } catch (error) {
    return [];
  }
}

// Função para extrair descrições de múltiplos usuários
async function extractMultipleUsersBadges() {
  const allBadges = new Map();
  let totalUsers = 0;
  let totalBadges = 0;

  console.log(`📥 Buscando emblemas de ${KNOWN_USERS.length} usuários...`);

  for (const username of KNOWN_USERS) {
    try {
      console.log(`🔍 Buscando usuário: ${username}`);
      const uniqueId = await findUserUniqueId(username);
      
      if (uniqueId) {
        console.log(`✅ Encontrado: ${username} (${uniqueId})`);
        const badges = await fetchUserBadges(uniqueId);
        
        if (badges.length > 0) {
          console.log(`📊 ${badges.length} emblemas encontrados para ${username}`);
          totalUsers++;
          totalBadges += badges.length;
          
          badges.forEach(badge => {
            if (badge.code && badge.description) {
              allBadges.set(badge.code, {
                name: badge.name || badge.code,
                description: badge.description,
                code: badge.code
              });
            }
          });
        } else {
          console.log(`⚠️ Nenhum emblema encontrado para ${username}`);
        }
      } else {
        console.log(`❌ Usuário ${username} não encontrado`);
      }
      
      // Pausa entre requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${username}:`, error.message);
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`👥 Usuários processados: ${totalUsers}`);
  console.log(`🏆 Total de emblemas coletados: ${totalBadges}`);
  console.log(`🔑 Emblemas únicos com descrições: ${allBadges.size}`);

  // Converter Map para objetos
  const badgeDescriptions = {};
  const fullBadgeInfo = {};

  allBadges.forEach((badge, code) => {
    badgeDescriptions[code] = badge.description;
    fullBadgeInfo[code] = {
      name: badge.name,
      description: badge.description,
      code: badge.code
    };
  });

  // Salvar descrições
  const descriptionsFile = path.join(__dirname, '..', 'src', 'data', 'real-badge-descriptions.json');
  fs.writeFileSync(descriptionsFile, JSON.stringify(badgeDescriptions, null, 2));
  console.log('💾 Descrições salvas em:', descriptionsFile);

  // Salvar informações completas
  const fullInfoFile = path.join(__dirname, '..', 'src', 'data', 'full-badge-info.json');
  fs.writeFileSync(fullInfoFile, JSON.stringify(fullBadgeInfo, null, 2));
  console.log('💾 Informações completas salvas em:', fullInfoFile);

  // Mostrar exemplos
  const examples = Array.from(allBadges.values()).slice(0, 15);
  console.log('\n📋 Exemplos de descrições encontradas:');
  examples.forEach(badge => {
    console.log(`  ${badge.code}: ${badge.description}`);
  });

  return badgeDescriptions;
}

// Executar extração
async function main() {
  try {
    const descriptions = await extractMultipleUsersBadges();
    console.log('\n✅ Extração de descrições concluída!');
    console.log(`📈 Total de emblemas únicos com descrições: ${Object.keys(descriptions).length}`);
  } catch (error) {
    console.error('❌ Erro durante a extração:', error);
    process.exit(1);
  }
}

main();
