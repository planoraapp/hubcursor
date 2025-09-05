import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Analisando categorias de emblemas...');

// Função para analisar padrões nos códigos dos emblemas
function analyzeBadgePatterns() {
  try {
    const fullBadgeInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'full-badge-info.json'), 'utf8'));
    const badgesByHotel = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'badges-by-hotel.json'), 'utf8'));
    
    console.log(`📊 Analisando ${Object.keys(fullBadgeInfo).length} emblemas...\n`);
    
    // Análise de países/regiões
    const countryPatterns = {
      'BR': 'Brasil',
      'US': 'Estados Unidos', 
      'ES': 'Espanha',
      'DE': 'Alemanha',
      'FR': 'França',
      'IT': 'Itália',
      'NL': 'Holanda',
      'NO': 'Noruega',
      'DK': 'Dinamarca',
      'SE': 'Suécia',
      'FI': 'Finlândia',
      'AU': 'Austrália',
      'SG': 'Singapura',
      'JP': 'Japão',
      'KR': 'Coreia',
      'CN': 'China',
      'RU': 'Rússia',
      'PL': 'Polônia',
      'CZ': 'República Tcheca',
      'HU': 'Hungria',
      'RO': 'Romênia',
      'BG': 'Bulgária',
      'GR': 'Grécia',
      'TR': 'Turquia',
      'IL': 'Israel',
      'ZA': 'África do Sul',
      'MX': 'México',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colômbia',
      'PE': 'Peru',
      'VE': 'Venezuela',
      'CA': 'Canadá',
      'UK': 'Reino Unido'
    };
    
    // Análise de tipos de emblemas
    const typePatterns = {
      'ACH_': 'Conquistas',
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
      'NFT': 'NFT',
      'HWN': 'Halloween',
      'VAL': 'Valentine',
      'EAST': 'Easter',
      'SPR': 'Spring',
      'AUT': 'Autumn',
      'WINT': 'Winter',
      'SUMM': 'Summer',
      'BIRTH': 'Birthday',
      'ANNIV': 'Anniversary',
      'SPEC': 'Special',
      'EVENT': 'Event',
      'COMP': 'Competition',
      'CONTEST': 'Contest',
      'GAME': 'Game',
      'SPORT': 'Sport',
      'MUSIC': 'Music',
      'ART': 'Art',
      'DESIGN': 'Design',
      'BUILD': 'Build',
      'ROOM': 'Room',
      'FURN': 'Furniture',
      'PETS': 'Pets',
      'FRIEND': 'Friends',
      'SOCIAL': 'Social',
      'CHAT': 'Chat',
      'TRADE': 'Trade',
      'GIFT': 'Gift',
      'RESPECT': 'Respect',
      'LEVEL': 'Level',
      'RANK': 'Rank',
      'VIP': 'VIP',
      'GOLD': 'Gold',
      'SILVER': 'Silver',
      'BRONZE': 'Bronze',
      'PLATINUM': 'Platinum',
      'DIAMOND': 'Diamond',
      'RUBY': 'Ruby',
      'EMERALD': 'Emerald',
      'SAPPHIRE': 'Sapphire',
      'GARNET': 'Garnet',
      'AMETHYST': 'Amethyst',
      'TOPAZ': 'Topaz',
      'CITRINE': 'Citrine',
      'PERIDOT': 'Peridot',
      'AQUAMARINE': 'Aquamarine',
      'TANZANITE': 'Tanzanite',
      'OPAL': 'Opal',
      'PEARL': 'Pearl',
      'JADE': 'Jade',
      'ONYX': 'Onyx',
      'JET': 'Jet',
      'COAL': 'Coal',
      'IRON': 'Iron',
      'STEEL': 'Steel',
      'COPPER': 'Copper',
      'BRASS': 'Brass',
      'TIN': 'Tin',
      'LEAD': 'Lead',
      'ZINC': 'Zinc',
      'NICKEL': 'Nickel',
      'CHROMIUM': 'Chromium',
      'MANGANESE': 'Manganese',
      'COBALT': 'Cobalt',
      'NICKEL': 'Nickel',
      'COPPER': 'Copper',
      'ZINC': 'Zinc',
      'TIN': 'Tin',
      'LEAD': 'Lead',
      'IRON': 'Iron',
      'STEEL': 'Steel',
      'COAL': 'Coal',
      'JET': 'Jet',
      'ONYX': 'Onyx',
      'JADE': 'Jade',
      'PEARL': 'Pearl',
      'OPAL': 'Opal',
      'TANZANITE': 'Tanzanite',
      'AQUAMARINE': 'Aquamarine',
      'PERIDOT': 'Peridot',
      'CITRINE': 'Citrine',
      'TOPAZ': 'Topaz',
      'AMETHYST': 'Amethyst',
      'GARNET': 'Garnet',
      'SAPPHIRE': 'Sapphire',
      'EMERALD': 'Emerald',
      'RUBY': 'Ruby',
      'DIAMOND': 'Diamond',
      'PLATINUM': 'Platinum',
      'BRONZE': 'Bronze',
      'SILVER': 'Silver',
      'GOLD': 'Gold',
      'VIP': 'VIP',
      'RANK': 'Rank',
      'LEVEL': 'Level',
      'RESPECT': 'Respect',
      'GIFT': 'Gift',
      'TRADE': 'Trade',
      'CHAT': 'Chat',
      'SOCIAL': 'Social',
      'FRIEND': 'Friends',
      'PETS': 'Pets',
      'FURN': 'Furniture',
      'ROOM': 'Room',
      'BUILD': 'Build',
      'DESIGN': 'Design',
      'ART': 'Art',
      'MUSIC': 'Music',
      'SPORT': 'Sport',
      'GAME': 'Game',
      'CONTEST': 'Contest',
      'COMP': 'Competition',
      'EVENT': 'Event',
      'SPEC': 'Special',
      'ANNIV': 'Anniversary',
      'BIRTH': 'Birthday',
      'SUMM': 'Summer',
      'WINT': 'Winter',
      'AUT': 'Autumn',
      'SPR': 'Spring',
      'EAST': 'Easter',
      'VAL': 'Valentine',
      'HWN': 'Halloween',
      'NFT': 'NFT',
      'XM': 'Christmas',
      'TBLT': 'Tablet',
      'AND': 'Android',
      'PET': 'Pet',
      'SCU': 'Scuba',
      'WOM': 'Woman',
      'SWB': 'Swab',
      'X': 'Special',
      'FRZ': 'Freeze',
      'SAF': 'Safety',
      'SID': 'Sid',
      'TER': 'Terry',
      'BER': 'Berlin',
      'RTS': 'Rats',
      'peg': 'Peg',
      'JAD': 'Jade',
      'PRV': 'Private',
      'STU': 'Studio',
      'NY': 'New Year',
      'GLO': 'Glow',
      'FBC': 'Facebook',
      'COK': 'Cock',
      'HOR': 'Horse',
      'DDC': 'Duck',
      'SMR': 'Summer',
      'COC': 'Cock',
      'RAR': 'Rare',
      'AQR': 'Aquarius',
      'DRA': 'Dragon',
      'DNY': 'Denny',
      'EPS': 'Epsilon',
      'COM': 'Community',
      'HLIVE': 'Habbo Live',
      'HLA': 'Habbo Live',
      'EDJA': 'Edja',
      'COMSN': 'Communication',
      'JUT': 'Jutland',
      'CPO': 'Cup',
      'BGW': 'Big Game Winner',
      'JPE': 'Japan',
      'RAF': 'RAF',
      'TR': 'Trophy',
      'TC': 'Trading Card',
      'ING': 'Ingame',
      'JOH': 'Johannes',
      'MAM': 'Mammoth',
      'LOT': 'Lottery',
      'ZOM': 'Zombie',
      'JET': 'Jet',
      'ELF': 'Elf',
      'DIE': 'Diamond',
      'HIT': 'Habbo International Team',
      'WUP': 'Wake Up Party',
      'HWS': 'Habbo Winter Special',
      'ACH_': 'Conquistas'
    };
    
    // Contar ocorrências
    const countryCounts = {};
    const typeCounts = {};
    const hotelCounts = {};
    
    Object.values(fullBadgeInfo).forEach(badge => {
      const code = badge.code;
      
      // Contar países
      for (const [prefix, country] of Object.entries(countryPatterns)) {
        if (code.startsWith(prefix)) {
          countryCounts[country] = (countryCounts[country] || 0) + 1;
          break;
        }
      }
      
      // Contar tipos
      for (const [prefix, type] of Object.entries(typePatterns)) {
        if (code.startsWith(prefix)) {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
          break;
        }
      }
    });
    
    // Contar hotéis
    Object.entries(badgesByHotel).forEach(([hotel, badges]) => {
      hotelCounts[hotel] = badges.length;
    });
    
    // Mostrar resultados
    console.log('🌍 PAÍSES/REGIÕES ENCONTRADOS:');
    Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([country, count]) => {
        console.log(`  ${country}: ${count} emblemas`);
      });
    
    console.log('\n🏷️ TIPOS DE EMBLEMAS ENCONTRADOS:');
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30) // Top 30
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} emblemas`);
      });
    
    console.log('\n🏨 HOTÉIS:');
    Object.entries(hotelCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([hotel, count]) => {
        console.log(`  ${hotel}: ${count} emblemas`);
      });
    
    // Salvar análise
    const analysis = {
      countries: countryCounts,
      types: typeCounts,
      hotels: hotelCounts,
      totalBadges: Object.keys(fullBadgeInfo).length
    };
    
    const analysisFile = path.join(__dirname, '..', 'src', 'data', 'badge-category-analysis.json');
    fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Análise salva em: ${analysisFile}`);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Erro ao analisar categorias:', error.message);
    return null;
  }
}

// Executar análise
analyzeBadgePatterns();
