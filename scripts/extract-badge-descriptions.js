import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Extraindo descrições reais dos emblemas do Habbo...');

// Lista de usuários conhecidos para extrair emblemas
const KNOWN_USERS = [
  'hhbr-908a5b5d1fab24fac6c02c5ae3d96d78', // Exemplo de usuário
  // Adicionar mais usuários conhecidos aqui
];

// Função para buscar emblemas de um usuário
async function fetchUserBadges(uniqueId) {
  try {
    console.log(`📥 Buscando emblemas do usuário: ${uniqueId}`);
    
    const response = await fetch(`https://www.habbo.com/api/public/users/${uniqueId}/badges`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const badges = await response.json();
    console.log(`✅ Encontrados ${badges.length} emblemas para o usuário ${uniqueId}`);
    
    return badges;
  } catch (error) {
    console.error(`❌ Erro ao buscar emblemas do usuário ${uniqueId}:`, error.message);
    return [];
  }
}

// Função para extrair descrições de múltiplos usuários
async function extractAllBadgeDescriptions() {
  const allBadges = new Map(); // Usar Map para evitar duplicatas
  
  for (const userId of KNOWN_USERS) {
    const userBadges = await fetchUserBadges(userId);
    
    userBadges.forEach(badge => {
      if (badge.code && badge.description) {
        allBadges.set(badge.code, {
          name: badge.name || badge.code,
          description: badge.description,
          code: badge.code
        });
      }
    });
    
    // Pequena pausa entre requisições para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`📊 Total de emblemas únicos com descrições: ${allBadges.size}`);

  // Converter Map para objeto
  const badgeDescriptions = {};
  allBadges.forEach((badge, code) => {
    badgeDescriptions[code] = badge.description;
  });

  // Salvar descrições
  const descriptionsFile = path.join(__dirname, '..', 'src', 'data', 'real-badge-descriptions.json');
  fs.writeFileSync(descriptionsFile, JSON.stringify(badgeDescriptions, null, 2));
  console.log('💾 Descrições salvas em:', descriptionsFile);

  // Salvar informações completas dos emblemas
  const fullBadgeInfo = {};
  allBadges.forEach((badge, code) => {
    fullBadgeInfo[code] = {
      name: badge.name,
      description: badge.description,
      code: badge.code
    };
  });

  const fullInfoFile = path.join(__dirname, '..', 'src', 'data', 'full-badge-info.json');
  fs.writeFileSync(fullInfoFile, JSON.stringify(fullBadgeInfo, null, 2));
  console.log('💾 Informações completas salvas em:', fullInfoFile);

  return badgeDescriptions;
}

// Função para buscar usuários populares/ativos
async function findActiveUsers() {
  console.log('🔍 Buscando usuários ativos para extrair mais emblemas...');
  
  // Lista de usuários conhecidos do Habbo (pode ser expandida)
  const popularUsers = [
    'hhbr-908a5b5d1fab24fac6c02c5ae3d96d78',
    // Adicionar mais usuários conhecidos aqui
  ];

  return popularUsers;
}

// Executar extração
async function main() {
  try {
    // Buscar usuários ativos
    const activeUsers = await findActiveUsers();
    KNOWN_USERS.push(...activeUsers);

    // Extrair descrições
    const descriptions = await extractAllBadgeDescriptions();
    
    console.log('✅ Extração de descrições concluída!');
    console.log(`📈 Total de emblemas com descrições: ${Object.keys(descriptions).length}`);
    
    // Mostrar alguns exemplos
    const examples = Object.entries(descriptions).slice(0, 5);
    console.log('\n📋 Exemplos de descrições encontradas:');
    examples.forEach(([code, description]) => {
      console.log(`  ${code}: ${description}`);
    });

  } catch (error) {
    console.error('❌ Erro durante a extração:', error);
    process.exit(1);
  }
}

main();
