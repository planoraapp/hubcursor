import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏆 Extraindo emblemas do Habbo Hotel...');

try {
  // Verificar se habbo-downloader está instalado
  try {
    execSync('hdl --version', { stdio: 'pipe' });
    console.log('✅ habbo-downloader encontrado');
  } catch (error) {
    console.log('❌ habbo-downloader não encontrado. Instalando...');
    execSync('npm install -g habbo-downloader', { stdio: 'inherit' });
  }

  // Criar diretório para badges se não existir
  const badgesDir = path.join(__dirname, '..', 'public', 'badges');
  if (!fs.existsSync(badgesDir)) {
    fs.mkdirSync(badgesDir, { recursive: true });
  }

  // Extrair badges do Habbo Brasil
  console.log('📥 Baixando emblemas do Habbo Brasil...');
  execSync(`hdl -c badges -f gif -d com.br -o "${badgesDir}"`, { 
    stdio: 'inherit',
    cwd: badgesDir
  });

  // Listar arquivos baixados do diretório correto
  const actualBadgesDir = path.join(badgesDir, 'c_images', 'album1584');
  const files = fs.readdirSync(actualBadgesDir);
  const gifFiles = files.filter(file => file.endsWith('.gif'));
  
  console.log(`✅ ${gifFiles.length} emblemas extraídos com sucesso!`);
  console.log('📁 Arquivos salvos em:', badgesDir);
  
  // Gerar lista de códigos de emblemas
  const badgeCodes = gifFiles.map(file => file.replace('.gif', ''));
  
  // Salvar lista de códigos
  const codesFile = path.join(__dirname, '..', 'src', 'data', 'badge-codes.json');
  const dataDir = path.dirname(codesFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(codesFile, JSON.stringify(badgeCodes, null, 2));
  console.log('💾 Lista de códigos salva em:', codesFile);
  
  // Gerar categorias básicas baseadas nos códigos
  const categorizedBadges = categorizeBadges(badgeCodes);
  const categoriesFile = path.join(__dirname, '..', 'src', 'data', 'badge-categories.json');
  fs.writeFileSync(categoriesFile, JSON.stringify(categorizedBadges, null, 2));
  console.log('📂 Categorias salvas em:', categoriesFile);

} catch (error) {
  console.error('❌ Erro ao extrair emblemas:', error.message);
  process.exit(1);
}

function categorizeBadges(codes) {
  const categories = {
    'Administração': [],
    'Eventos': [],
    'Raros': [],
    'Especiais': [],
    'Clássicos': [],
    'Nacionais': [],
    'Temporários': [],
    'Outros': []
  };

  codes.forEach(code => {
    const upperCode = code.toUpperCase();
    
    // Categorizar baseado em padrões conhecidos
    if (upperCode.includes('ADM') || upperCode.includes('MOD') || upperCode.includes('HC')) {
      categories['Administração'].push(code);
    } else if (upperCode.includes('EVENT') || upperCode.includes('COMP') || upperCode.includes('WINNER')) {
      categories['Eventos'].push(code);
    } else if (upperCode.includes('RARE') || upperCode.includes('DIAMOND') || upperCode.includes('STAR')) {
      categories['Raros'].push(code);
    } else if (upperCode.includes('BUILDER') || upperCode.includes('ARTIST') || upperCode.includes('HELPER')) {
      categories['Especiais'].push(code);
    } else if (upperCode.includes('CLASSIC') || upperCode.includes('VINTAGE') || upperCode.includes('BASIC')) {
      categories['Clássicos'].push(code);
    } else if (upperCode.includes('BR') || upperCode.includes('US') || upperCode.includes('ES') || upperCode.includes('DE')) {
      categories['Nacionais'].push(code);
    } else if (upperCode.includes('TEMP') || upperCode.includes('PIXEL')) {
      categories['Temporários'].push(code);
    } else {
      categories['Outros'].push(code);
    }
  });

  return categories;
}
