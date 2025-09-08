import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Buscando mais usuários com emblemas...');

// Lista expandida de usuários para testar
const USERNAMES_TO_TEST = [
  // Usuários oficiais
  'Habbo', 'Habbo2', 'Habbo3', 'Habbo4', 'Habbo5', 'Habbo6', 'Habbo7', 'Habbo8', 'Habbo9', 'Habbo10',
  'Sulake', 'Sulake2', 'Sulake3',
  'Admin', 'Admin2', 'Admin3',
  'Moderator', 'Moderator2', 'Moderator3',
  'Staff', 'Staff2', 'Staff3',
  'Helper', 'Helper2', 'Helper3', 'Helper4', 'Helper5',
  'Guide', 'Guide2', 'Guide3', 'Guide4', 'Guide5',
  'Builder', 'Builder2', 'Builder3', 'Builder4', 'Builder5',
  'Artist', 'Artist2', 'Artist3', 'Artist4', 'Artist5',
  
  // Usuários populares conhecidos
  'Beebop', 'Beebop2', 'Beebop3',
  'Test', 'Test2', 'Test3',
  'Demo', 'Demo2', 'Demo3',
  'Guest', 'Guest2', 'Guest3',
  'Player', 'Player2', 'Player3',
  'User', 'User2', 'User3',
  'Member', 'Member2', 'Member3',
  
  // Nomes comuns
  'Alex', 'Alex2', 'Alex3',
  'Chris', 'Chris2', 'Chris3',
  'David', 'David2', 'David3',
  'Emma', 'Emma2', 'Emma3',
  'John', 'John2', 'John3',
  'Lisa', 'Lisa2', 'Lisa3',
  'Mike', 'Mike2', 'Mike3',
  'Sarah', 'Sarah2', 'Sarah3',
  'Tom', 'Tom2', 'Tom3',
  
  // Nomes do Habbo
  'HabboHotel', 'HabboHotel2',
  'HabboClub', 'HabboClub2',
  'HabboVIP', 'HabboVIP2',
  'HabboGold', 'HabboGold2',
  'HabboSilver', 'HabboSilver2',
  'HabboBronze', 'HabboBronze2',
  
  // Nomes de eventos
  'Christmas', 'Christmas2',
  'Halloween', 'Halloween2',
  'Easter', 'Easter2',
  'Valentine', 'Valentine2',
  'NewYear', 'NewYear2',
  'Summer', 'Summer2',
  'Winter', 'Winter2',
  'Spring', 'Spring2',
  'Autumn', 'Autumn2'
];

// Função para buscar usuário e seus emblemas
async function findUserWithBadges(username) {
  try {
    // Buscar uniqueId
    const userResponse = await fetch(`https://www.habbo.com/api/public/users?name=${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!userResponse.ok) {
      return null;
    }

    const userData = await userResponse.json();
    if (!userData.uniqueId) {
      return null;
    }

    // Buscar emblemas
    const badgesResponse = await fetch(`https://www.habbo.com/api/public/users/${userData.uniqueId}/badges`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!badgesResponse.ok) {
      return null;
    }

    const badges = await badgesResponse.json();
    
    if (badges.length === 0) {
      return null;
    }

    return {
      username,
      uniqueId: userData.uniqueId,
      badgeCount: badges.length,
      badges: badges
    };

  } catch (error) {
    return null;
  }
}

// Função principal
async function main() {
  const usersWithBadges = [];
  let processed = 0;

  console.log(`📥 Testando ${USERNAMES_TO_TEST.length} usuários...\n`);

  for (const username of USERNAMES_TO_TEST) {
    processed++;
    console.log(`🔍 [${processed}/${USERNAMES_TO_TEST.length}] Testando: ${username}`);
    
    const userData = await findUserWithBadges(username);
    
    if (userData) {
      usersWithBadges.push(userData);
      console.log(`✅ ${username}: ${userData.badgeCount} emblemas`);
    } else {
      console.log(`❌ ${username}: não encontrado ou sem emblemas`);
    }

    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Ordenar por quantidade de emblemas
  usersWithBadges.sort((a, b) => b.badgeCount - a.badgeCount);

  console.log(`\n📊 Resultados:`);
  console.log(`👥 Usuários encontrados: ${usersWithBadges.length}`);
  console.log(`🏆 Total de emblemas: ${usersWithBadges.reduce((sum, user) => sum + user.badgeCount, 0)}`);

  console.log(`\n📋 Top 20 usuários com mais emblemas:`);
  usersWithBadges.slice(0, 20).forEach((user, index) => {
    console.log(`${index + 1}. ${user.username}: ${user.badgeCount} emblemas`);
  });

  // Salvar resultados
  const resultsFile = path.join(__dirname, '..', 'src', 'data', 'badge-users-found.json');
  fs.writeFileSync(resultsFile, JSON.stringify(usersWithBadges, null, 2));
  console.log(`\n💾 Resultados salvos em: ${resultsFile}`);

  return usersWithBadges;
}

main().catch(console.error);
