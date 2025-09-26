// scripts/auto-extract-handitems.cjs - Script automático para extrair handitems
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function autoExtractHanditems() {
  console.log('🚀 INICIANDO EXTRAÇÃO AUTOMÁTICA DE HANDITEMS...');
  
  try {
    // 1. Instalar habbo-downloader se necessário
    console.log('📦 Verificando/Instalando habbo-downloader...');
    try {
      execSync('habbo-downloader --version', { stdio: 'pipe' });
      console.log('✅ habbo-downloader já instalado!');
    } catch (error) {
      console.log('📦 Instalando habbo-downloader...');
      execSync('npm install -g habbo-downloader', { stdio: 'inherit' });
      console.log('✅ habbo-downloader instalado!');
    }
    
    // 2. Criar diretório para handitems
    const handitemsDir = path.join(process.cwd(), 'public', 'handitems');
    if (!fs.existsSync(handitemsDir)) {
      fs.mkdirSync(handitemsDir, { recursive: true });
      console.log('📁 Diretório criado: public/handitems');
    }
    
    // 3. Baixar arquivos Gordon (contém SWF dos handitems)
    console.log('⬇️ Baixando arquivos Gordon (SWF dos handitems)...');
    execSync(`hdl -c gordon -d com.br -o "${handitemsDir}"`, { stdio: 'inherit' });
    
    // 4. Baixar dados do jogo (external_flash_texts)
    console.log('⬇️ Baixando dados do jogo (nomes dos handitems)...');
    execSync(`hdl -c gamedata -d com.br -o "${handitemsDir}"`, { stdio: 'inherit' });
    
    // 5. Baixar mobílias (que podem dar handitems)
    console.log('⬇️ Baixando mobílias (fonte de handitems)...');
    execSync(`hdl -c furnitures -d com.br -o "${handitemsDir}"`, { stdio: 'inherit' });
    
    // 6. Listar arquivos baixados
    console.log('📁 Arquivos baixados:');
    listFiles(handitemsDir, 0);
    
    // 7. Procurar arquivos específicos de handitems
    console.log('🔍 Procurando arquivos de handitems...');
    const swfFiles = findFiles(handitemsDir, '.swf');
    const handitemSwf = swfFiles.find(f => f.includes('hh_human_item'));
    
    if (handitemSwf) {
      console.log(`✅ Arquivo hh_human_item.swf encontrado: ${handitemSwf}`);
    } else {
      console.log('⚠️ Arquivo hh_human_item.swf não encontrado');
      console.log('📁 Arquivos SWF disponíveis:');
      swfFiles.forEach(f => console.log(`  - ${path.basename(f)}`));
    }
    
    // 8. Procurar external_flash_texts
    const txtFiles = findFiles(handitemsDir, '.txt');
    const flashTexts = txtFiles.find(f => f.includes('external_flash_texts'));
    
    if (flashTexts) {
      console.log(`✅ external_flash_texts encontrado: ${flashTexts}`);
      extractHanditemNames(flashTexts, handitemsDir);
    } else {
      console.log('⚠️ external_flash_texts não encontrado');
    }
    
    console.log('✅ EXTRAÇÃO AUTOMÁTICA CONCLUÍDA!');
    console.log(`📁 Todos os arquivos salvos em: ${handitemsDir}`);
    
  } catch (error) {
    console.error('❌ ERRO na extração automática:', error.message);
    process.exit(1);
  }
}

function listFiles(dir, depth) {
  try {
    const items = fs.readdirSync(dir);
    items.slice(0, 10).forEach(item => {
      const fullPath = path.join(dir, item);
      const indent = '  '.repeat(depth);
      if (fs.statSync(fullPath).isDirectory()) {
        console.log(`${indent}📁 ${item}/`);
        if (depth < 2) {
          listFiles(fullPath, depth + 1);
        }
      } else {
        console.log(`${indent}📄 ${item}`);
      }
    });
    if (items.length > 10) {
      console.log(`${'  '.repeat(depth)}... e mais ${items.length - 10} arquivos`);
    }
  } catch (error) {
    console.error(`Erro ao listar ${dir}:`, error.message);
  }
}

function findFiles(dir, extension) {
  const files = [];
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        files.push(...findFiles(fullPath, extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    // Ignorar erros de diretório
  }
  return files;
}

function extractHanditemNames(flashTextsFile, outputDir) {
  try {
    console.log('📝 Extraindo nomes dos handitems...');
    const content = fs.readFileSync(flashTextsFile, 'utf-8');
    
    const handitemRegex = /handitem(\d+)=(.+)/g;
    const handitems = [];
    let match;
    
    while ((match = handitemRegex.exec(content)) !== null) {
      handitems.push({
        id: parseInt(match[1]),
        name: match[2].trim()
      });
    }
    
    console.log(`✅ Encontrados ${handitems.length} handitems:`);
    handitems.slice(0, 10).forEach(item => {
      console.log(`  - handitem${item.id}: ${item.name}`);
    });
    
    if (handitems.length > 10) {
      console.log(`  ... e mais ${handitems.length - 10} handitems`);
    }
    
    // Salvar lista
    const handitemsFile = path.join(outputDir, 'handitems.json');
    fs.writeFileSync(handitemsFile, JSON.stringify(handitems, null, 2));
    console.log(`💾 Lista salva em: ${handitemsFile}`);
    
  } catch (error) {
    console.error('Erro ao extrair nomes:', error.message);
  }
}

// Executar automaticamente
autoExtractHanditems();
