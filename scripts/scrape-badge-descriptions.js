import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Extraindo descrições reais dos emblemas do site Arquivos Habbo...');

// Função para extrair descrições do site Arquivos Habbo
async function scrapeBadgeDescriptions() {
  try {
    console.log('📥 Acessando site Arquivos Habbo...');
    
    const response = await fetch('https://arquivos.comprahabbo.com/emblemas-com-desc-e-titulo', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('✅ HTML obtido com sucesso');

    // Extrair informações dos emblemas usando regex
    const badgeRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<\/tr>/g;
    const badges = [];
    let match;

    while ((match = badgeRegex.exec(html)) !== null) {
      const code = match[1].trim();
      const name = match[2].trim();
      const description = match[3].trim();
      
      if (code && name && description) {
        badges.push({
          code,
          name,
          description
        });
      }
    }

    console.log(`📊 Encontrados ${badges.length} emblemas com descrições`);

    // Converter para objeto de descrições
    const badgeDescriptions = {};
    const fullBadgeInfo = {};

    badges.forEach(badge => {
      badgeDescriptions[badge.code] = badge.description;
      fullBadgeInfo[badge.code] = {
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

    // Mostrar alguns exemplos
    const examples = badges.slice(0, 10);
    console.log('\n📋 Exemplos de descrições encontradas:');
    examples.forEach(badge => {
      console.log(`  ${badge.code}: ${badge.description}`);
    });

    return badgeDescriptions;

  } catch (error) {
    console.error('❌ Erro ao extrair descrições:', error.message);
    
    // Fallback: criar descrições básicas baseadas nos códigos que temos
    console.log('🔄 Criando descrições básicas como fallback...');
    return createFallbackDescriptions();
  }
}

// Função para criar descrições básicas como fallback
function createFallbackDescriptions() {
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
  // Padrões conhecidos
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
    const descriptions = await scrapeBadgeDescriptions();
    console.log('✅ Extração de descrições concluída!');
    console.log(`📈 Total de emblemas com descrições: ${Object.keys(descriptions).length}`);
  } catch (error) {
    console.error('❌ Erro durante a extração:', error);
    process.exit(1);
  }
}

main();
