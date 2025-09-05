import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Extraindo todas as descrições de emblemas...');

// Função para extrair achievements (conquistas)
async function extractAchievements() {
  try {
    console.log('📥 Buscando achievements da API...');
    const response = await fetch('https://www.habbo.com/api/public/achievements', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const achievements = await response.json();
    console.log(`✅ Encontrados ${achievements.length} achievements`);

    const achievementDescriptions = {};
    achievements.forEach(achievement => {
      if (achievement.achievement && achievement.achievement.name) {
        const code = `ACH_${achievement.achievement.name}`;
        achievementDescriptions[code] = `Conquista: ${achievement.achievement.name}`;
      }
    });

    return achievementDescriptions;
  } catch (error) {
    console.error('❌ Erro ao extrair achievements:', error.message);
    return {};
  }
}

// Função para extrair emblemas de usuários
async function extractUserBadges() {
  const users = ['Artist', 'Guide', 'Habbo', 'Helper', 'Beebop', 'Builder'];
  const allBadges = new Map();

  for (const username of users) {
    try {
      console.log(`👤 Buscando emblemas de ${username}...`);
      
      const userResponse = await fetch(`https://www.habbo.com/api/public/users?name=${encodeURIComponent(username)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.uniqueId) {
          const badgesResponse = await fetch(`https://www.habbo.com/api/public/users/${userData.uniqueId}/badges`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (badgesResponse.ok) {
            const badges = await badgesResponse.json();
            badges.forEach(badge => {
              if (badge.code && badge.description) {
                allBadges.set(badge.code, {
                  name: badge.name || badge.code,
                  description: badge.description,
                  code: badge.code
                });
              }
            });
            console.log(`✅ ${badges.length} emblemas de ${username}`);
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ Erro ao buscar ${username}: ${error.message}`);
    }
  }

  return allBadges;
}

// Função para gerar descrições baseadas em padrões
function generatePatternDescriptions() {
  const patterns = {
    'ACH_': 'Conquista do Habbo Hotel',
    'BR': 'Emblema do Brasil',
    'US': 'Emblema dos Estados Unidos',
    'ES': 'Emblema da Espanha',
    'DE': 'Emblema da Alemanha',
    'UK': 'Emblema do Reino Unido',
    'FR': 'Emblema da França',
    'IT': 'Emblema da Itália',
    'NL': 'Emblema da Holanda',
    'NO': 'Emblema da Noruega',
    'DK': 'Emblema da Dinamarca',
    'SE': 'Emblema da Suécia',
    'FI': 'Emblema da Finlândia',
    'AU': 'Emblema da Austrália',
    'SG': 'Emblema de Singapura',
    'JP': 'Emblema do Japão',
    'KR': 'Emblema da Coreia',
    'CN': 'Emblema da China',
    'RU': 'Emblema da Rússia',
    'PL': 'Emblema da Polônia',
    'CZ': 'Emblema da República Tcheca',
    'HU': 'Emblema da Hungria',
    'RO': 'Emblema da Romênia',
    'BG': 'Emblema da Bulgária',
    'GR': 'Emblema da Grécia',
    'TR': 'Emblema da Turquia',
    'IL': 'Emblema de Israel',
    'ZA': 'Emblema da África do Sul',
    'MX': 'Emblema do México',
    'AR': 'Emblema da Argentina',
    'CL': 'Emblema do Chile',
    'CO': 'Emblema da Colômbia',
    'PE': 'Emblema do Peru',
    'VE': 'Emblema da Venezuela',
    'CA': 'Emblema do Canadá',
    'NB': 'Emblema Nomeado',
    'HWS': 'Habbo Winter Special',
    'WUP': 'Wake Up Party',
    'HIT': 'Habbo International Team',
    'DIE': 'Diamond',
    'ELF': 'Elf',
    'JET': 'Jet',
    'ZOM': 'Zombie',
    'LOT': 'Lottery',
    'MAM': 'Mammoth',
    'JOH': 'Johannes',
    'ING': 'Ingame',
    'TC': 'Trading Card',
    'TR': 'Trophy',
    'RAF': 'RAF',
    'JPE': 'Japan',
    'BGW': 'Big Game Winner',
    'CPO': 'Cup',
    'JUT': 'Jutland',
    'COMSN': 'Communication',
    'EDJA': 'Edja',
    'HLA': 'Habbo Live',
    'HLIVE': 'Habbo Live',
    'COM': 'Community',
    'EPS': 'Epsilon',
    'DNY': 'Denny',
    'DRA': 'Dragon',
    'AQR': 'Aquarius',
    'RAR': 'Rare',
    'SNK': 'Snake',
    'COC': 'Cock',
    'SMR': 'Summer',
    'DDC': 'Duck',
    'HOR': 'Horse',
    'COK': 'Cock',
    'FBC': 'Facebook',
    'GLO': 'Glow',
    'NY': 'New Year',
    'STU': 'Studio',
    'PRV': 'Private',
    'JAD': 'Jade',
    'peg': 'Peg',
    'RTS': 'Rats',
    'BER': 'Berlin',
    'TER': 'Terry',
    'SID': 'Sid',
    'SAF': 'Safety',
    'FRZ': 'Freeze',
    'X': 'Special',
    'SWB': 'Swab',
    'WOM': 'Woman',
    'SCU': 'Scuba',
    'PET': 'Pet',
    'AND': 'Android',
    'TBLT': 'Tablet',
    'XM': 'Christmas',
    'NFT': 'NFT'
  };

  return patterns;
}

// Função principal
async function main() {
  try {
    // Extrair achievements
    const achievements = await extractAchievements();
    
    // Extrair emblemas de usuários
    const userBadges = await extractUserBadges();
    
    // Gerar descrições por padrão
    const patterns = generatePatternDescriptions();
    
    // Combinar todas as descrições
    const allDescriptions = { ...achievements };
    const fullBadgeInfo = {};
    
    // Adicionar emblemas de usuários
    userBadges.forEach((badge, code) => {
      allDescriptions[code] = badge.description;
      fullBadgeInfo[code] = {
        name: badge.name,
        description: badge.description,
        code: badge.code
      };
    });
    
    // Adicionar padrões para emblemas sem descrição
    const badgeCodes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'badge-codes.json'), 'utf8'));
    
    badgeCodes.forEach(code => {
      if (!allDescriptions[code]) {
        for (const [prefix, description] of Object.entries(patterns)) {
          if (code.startsWith(prefix)) {
            allDescriptions[code] = description;
            break;
          }
        }
        
        if (!allDescriptions[code]) {
          allDescriptions[code] = `Emblema ${code}`;
        }
      }
    });
    
    // Salvar descrições
    const descriptionsFile = path.join(__dirname, '..', 'src', 'data', 'real-badge-descriptions.json');
    fs.writeFileSync(descriptionsFile, JSON.stringify(allDescriptions, null, 2));
    console.log(`💾 Descrições salvas em: ${descriptionsFile}`);
    
    // Salvar informações completas
    const fullInfoFile = path.join(__dirname, '..', 'src', 'data', 'full-badge-info.json');
    fs.writeFileSync(fullInfoFile, JSON.stringify(fullBadgeInfo, null, 2));
    console.log(`💾 Informações completas salvas em: ${fullInfoFile}`);
    
    console.log(`\n✅ Extração concluída!`);
    console.log(`📊 Total de emblemas com descrições: ${Object.keys(allDescriptions).length}`);
    console.log(`📊 Achievements: ${Object.keys(achievements).length}`);
    console.log(`📊 Emblemas de usuários: ${userBadges.size}`);
    
  } catch (error) {
    console.error('❌ Erro durante a extração:', error);
  }
}

main();
