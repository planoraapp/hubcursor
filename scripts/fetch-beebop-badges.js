import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Buscando emblemas do usuário Beebop...');

// Função para buscar uniqueId do usuário Beebop
async function findBeebopUniqueId() {
  try {
    console.log('📥 Buscando informações do usuário Beebop...');
    
    // Tentar diferentes variações do nome
    const variations = ['Beebop', 'beebop', 'BEEBOP'];
    
    for (const name of variations) {
      try {
        const response = await fetch(`https://www.habbo.com/api/public/users?name=${encodeURIComponent(name)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.uniqueId) {
            console.log(`✅ Encontrado uniqueId para ${name}: ${data.uniqueId}`);
            return data.uniqueId;
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao buscar ${name}: ${error.message}`);
      }
    }

    // Se não encontrar, tentar buscar diretamente por uniqueId conhecido
    console.log('🔄 Tentando buscar diretamente por uniqueId conhecido...');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error.message);
    return null;
  }
}

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

// Função para extrair descrições dos emblemas
async function extractBadgeDescriptions() {
  try {
    // Primeiro, tentar encontrar o uniqueId do Beebop
    let uniqueId = await findBeebopUniqueId();
    
    // Se não encontrar, usar um uniqueId conhecido do Beebop (se você souber)
    if (!uniqueId) {
      console.log('⚠️ Não foi possível encontrar o uniqueId do Beebop automaticamente');
      console.log('💡 Você pode fornecer o uniqueId manualmente ou tentar com outro usuário conhecido');
      
      // Tentar alguns uniqueIds conhecidos de usuários populares
      const knownUsers = [
        // Adicionar uniqueIds conhecidos aqui se necessário
      ];
      
      for (const userId of knownUsers) {
        const badges = await fetchUserBadges(userId);
        if (badges.length > 0) {
          uniqueId = userId;
          break;
        }
      }
    }

    if (!uniqueId) {
      console.log('❌ Não foi possível encontrar um usuário válido');
      return createFallbackDescriptions();
    }

    // Buscar emblemas do usuário
    const badges = await fetchUserBadges(uniqueId);
    
    if (badges.length === 0) {
      console.log('⚠️ Nenhum emblema encontrado, criando descrições básicas...');
      return createFallbackDescriptions();
    }

    // Processar emblemas
    const badgeDescriptions = {};
    const fullBadgeInfo = {};

    badges.forEach(badge => {
      if (badge.code && badge.description) {
        badgeDescriptions[badge.code] = badge.description;
        fullBadgeInfo[badge.code] = {
          name: badge.name || badge.code,
          description: badge.description,
          code: badge.code
        };
      }
    });

    console.log(`📊 Processados ${Object.keys(badgeDescriptions).length} emblemas com descrições`);

    // Salvar descrições
    const descriptionsFile = path.join(__dirname, '..', 'src', 'data', 'real-badge-descriptions.json');
    fs.writeFileSync(descriptionsFile, JSON.stringify(badgeDescriptions, null, 2));
    console.log('💾 Descrições salvas em:', descriptionsFile);

    // Salvar informações completas
    const fullInfoFile = path.join(__dirname, '..', 'src', 'data', 'full-badge-info.json');
    fs.writeFileSync(fullInfoFile, JSON.stringify(fullBadgeInfo, null, 2));
    console.log('💾 Informações completas salvas em:', fullInfoFile);

    // Mostrar alguns exemplos
    const examples = Object.entries(badgeDescriptions).slice(0, 10);
    console.log('\n📋 Exemplos de descrições encontradas:');
    examples.forEach(([code, description]) => {
      console.log(`  ${code}: ${description}`);
    });

    return badgeDescriptions;

  } catch (error) {
    console.error('❌ Erro durante a extração:', error.message);
    return createFallbackDescriptions();
  }
}

// Função para criar descrições básicas como fallback
function createFallbackDescriptions() {
  console.log('🔄 Criando descrições básicas como fallback...');
  
  const badgeCodes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'badge-codes.json'), 'utf8'));
  const descriptions = {};

  badgeCodes.forEach(code => {
    descriptions[code] = generateDescriptionFromCode(code);
  });

  const descriptionsFile = path.join(__dirname, '..', 'src', 'data', 'real-badge-descriptions.json');
  fs.writeFileSync(descriptionsFile, JSON.stringify(descriptions, null, 2));
  console.log('💾 Descrições básicas salvas em:', descriptionsFile);

  return descriptions;
}

// Função para gerar descrição baseada no código
function generateDescriptionFromCode(code) {
  // Padrões conhecidos mais específicos
  if (code.includes('ACH_')) {
    return 'Conquista do Habbo Hotel';
  }
  if (code.startsWith('BR')) {
    return 'Emblema do Brasil';
  }
  if (code.startsWith('US')) {
    return 'Emblema dos Estados Unidos';
  }
  if (code.startsWith('ES')) {
    return 'Emblema da Espanha';
  }
  if (code.startsWith('DE')) {
    return 'Emblema da Alemanha';
  }
  if (code.startsWith('UK')) {
    return 'Emblema do Reino Unido';
  }
  if (code.startsWith('FR')) {
    return 'Emblema da França';
  }
  if (code.startsWith('IT')) {
    return 'Emblema da Itália';
  }
  if (code.startsWith('NL')) {
    return 'Emblema da Holanda';
  }
  if (code.startsWith('NB')) {
    return 'Emblema Nomeado';
  }
  if (code.startsWith('HWS')) {
    return 'Habbo Winter Special';
  }
  if (code.startsWith('WUP')) {
    return 'Wake Up Party';
  }
  if (code.startsWith('HIT')) {
    return 'Habbo International Team';
  }
  if (code.startsWith('DIE')) {
    return 'Diamond';
  }
  if (code.startsWith('ELF')) {
    return 'Elf';
  }
  if (code.startsWith('JET')) {
    return 'Jet';
  }
  if (code.startsWith('ZOM')) {
    return 'Zombie';
  }
  if (code.startsWith('LOT')) {
    return 'Lottery';
  }
  if (code.startsWith('MAM')) {
    return 'Mammoth';
  }
  if (code.startsWith('MIN')) {
    return 'Mining';
  }
  if (code.startsWith('JOH')) {
    return 'Johannes';
  }
  if (code.startsWith('ING')) {
    return 'Ingame';
  }
  if (code.startsWith('TC')) {
    return 'Trading Card';
  }
  if (code.startsWith('TR')) {
    return 'Trophy';
  }
  if (code.startsWith('NO')) {
    return 'Norway';
  }
  if (code.startsWith('RAF')) {
    return 'RAF';
  }
  if (code.startsWith('JPE')) {
    return 'Japan';
  }
  if (code.startsWith('BGW')) {
    return 'Big Game Winner';
  }
  if (code.startsWith('CPO')) {
    return 'Cup';
  }
  if (code.startsWith('JUT')) {
    return 'Jutland';
  }
  if (code.startsWith('COMSN')) {
    return 'Communication';
  }
  if (code.startsWith('EDJA')) {
    return 'Edja';
  }
  if (code.startsWith('HLA')) {
    return 'Habbo Live';
  }
  if (code.startsWith('HLIVE')) {
    return 'Habbo Live';
  }

  return `Emblema ${code}`;
}

// Executar extração
async function main() {
  try {
    const descriptions = await extractBadgeDescriptions();
    console.log('✅ Extração de descrições concluída!');
    console.log(`📈 Total de emblemas com descrições: ${Object.keys(descriptions).length}`);
  } catch (error) {
    console.error('❌ Erro durante a extração:', error);
    process.exit(1);
  }
}

main();
