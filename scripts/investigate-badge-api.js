import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Investigando APIs de emblemas do Habbo...');

// Função para testar diferentes endpoints da API
async function testBadgeEndpoints() {
  const endpoints = [
    'https://www.habbo.com/api/public/badges',
    'https://www.habbo.com/api/public/badges/list',
    'https://www.habbo.com/api/public/badges/all',
    'https://www.habbo.com/api/public/badges/descriptions',
    'https://www.habbo.com/api/public/badges/catalog',
    'https://www.habbo.com/api/public/catalog/badges',
    'https://www.habbo.com/api/public/achievements',
    'https://www.habbo.com/api/public/achievements/list',
    'https://www.habbo.com/api/public/achievements/all'
  ];

  console.log('📡 Testando endpoints da API...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testando: ${endpoint}`);
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Sucesso! Status: ${response.status}`);
        console.log(`📊 Dados recebidos: ${JSON.stringify(data).length} caracteres`);
        
        if (Array.isArray(data)) {
          console.log(`📋 Array com ${data.length} itens`);
          if (data.length > 0) {
            console.log(`🔍 Primeiro item:`, JSON.stringify(data[0], null, 2));
          }
        } else if (typeof data === 'object') {
          console.log(`🔍 Chaves do objeto:`, Object.keys(data));
        }
      } else {
        console.log(`❌ Erro: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Erro de conexão: ${error.message}`);
    }
    console.log('---\n');
  }
}

// Função para buscar usuários com muitos emblemas
async function findUsersWithManyBadges() {
  console.log('👥 Buscando usuários com muitos emblemas...\n');
  
  const popularUsers = [
    'Habbo', 'Beebop', 'Guide', 'Artist', 'Builder', 'Helper',
    'Sulake', 'Admin', 'Moderator', 'Staff', 'Helper2', 'Guide2',
    'Artist2', 'Builder2', 'Habbo2', 'Habbo3', 'Habbo4', 'Habbo5'
  ];

  const usersWithBadges = [];

  for (const username of popularUsers) {
    try {
      console.log(`🔍 Buscando: ${username}`);
      
      // Buscar uniqueId
      const userResponse = await fetch(`https://www.habbo.com/api/public/users?name=${encodeURIComponent(username)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.uniqueId) {
          // Buscar emblemas
          const badgesResponse = await fetch(`https://www.habbo.com/api/public/users/${userData.uniqueId}/badges`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (badgesResponse.ok) {
            const badges = await badgesResponse.json();
            if (badges.length > 0) {
              usersWithBadges.push({
                username,
                uniqueId: userData.uniqueId,
                badgeCount: badges.length,
                badges: badges
              });
              console.log(`✅ ${username}: ${badges.length} emblemas`);
            }
          }
        }
      }
      
      // Pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Erro ao buscar ${username}: ${error.message}`);
    }
  }

  // Ordenar por quantidade de emblemas
  usersWithBadges.sort((a, b) => b.badgeCount - a.badgeCount);

  console.log('\n📊 Usuários com mais emblemas:');
  usersWithBadges.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username}: ${user.badgeCount} emblemas`);
  });

  return usersWithBadges;
}

// Função para analisar padrões nos emblemas
async function analyzeBadgePatterns(usersWithBadges) {
  console.log('\n🔍 Analisando padrões nos emblemas...\n');

  const allBadges = new Map();
  const badgeCategories = new Map();

  usersWithBadges.forEach(user => {
    user.badges.forEach(badge => {
      if (badge.code && badge.description) {
        allBadges.set(badge.code, {
          name: badge.name || badge.code,
          description: badge.description,
          code: badge.code,
          users: (allBadges.get(badge.code)?.users || 0) + 1
        });

        // Categorizar por prefixo
        const prefix = badge.code.split('_')[0];
        if (!badgeCategories.has(prefix)) {
          badgeCategories.set(prefix, []);
        }
        badgeCategories.get(prefix).push(badge.code);
      }
    });
  });

  console.log(`📊 Total de emblemas únicos encontrados: ${allBadges.size}`);
  console.log(`📊 Categorias identificadas: ${badgeCategories.size}`);

  console.log('\n📋 Categorias de emblemas:');
  Array.from(badgeCategories.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([prefix, codes]) => {
      console.log(`  ${prefix}: ${codes.length} emblemas`);
    });

  // Salvar análise
  const analysisFile = path.join(__dirname, '..', 'src', 'data', 'badge-analysis.json');
  fs.writeFileSync(analysisFile, JSON.stringify({
    totalBadges: allBadges.size,
    categories: Object.fromEntries(badgeCategories),
    badges: Object.fromEntries(allBadges)
  }, null, 2));

  console.log(`\n💾 Análise salva em: ${analysisFile}`);

  return allBadges;
}

// Função principal
async function main() {
  try {
    // Testar endpoints da API
    await testBadgeEndpoints();
    
    // Buscar usuários com emblemas
    const usersWithBadges = await findUsersWithManyBadges();
    
    if (usersWithBadges.length > 0) {
      // Analisar padrões
      const allBadges = await analyzeBadgePatterns(usersWithBadges);
      
      console.log('\n✅ Investigação concluída!');
      console.log(`📈 Total de emblemas únicos: ${allBadges.size}`);
    } else {
      console.log('❌ Nenhum usuário com emblemas encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a investigação:', error);
  }
}

main();
