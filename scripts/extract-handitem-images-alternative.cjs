// scripts/extract-handitem-images-alternative.cjs - Script alternativo para extrair imagens dos handitems
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function extractHanditemImagesAlternative() {
  console.log('🚀 EXTRAÇÃO ALTERNATIVA DE IMAGENS DOS HANDITEMS...');
  
  try {
    // 1. Verificar se habbo-downloader pode extrair imagens
    console.log('🔍 Tentando extrair imagens com habbo-downloader...');
    
    const imagesDir = path.join(process.cwd(), 'public', 'handitems', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Criar subdiretórios
    ['drk', 'crr', 'preview'].forEach(subdir => {
      const subdirPath = path.join(imagesDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
      }
    });
    
    // 2. Tentar extrair imagens usando habbo-downloader
    try {
      console.log('📸 Tentando extrair imagens com habbo-downloader...');
      execSync(`habbo-downloader -c images -d com.br -o "${imagesDir}"`, { stdio: 'inherit' });
      console.log('✅ Imagens extraídas com habbo-downloader!');
    } catch (error) {
      console.log('⚠️ habbo-downloader não conseguiu extrair imagens diretamente');
      console.log('📝 Tentando método alternativo...');
    }
    
    // 3. Verificar se temos imagens PNG na pasta dcr/hof_furni
    console.log('🔍 Procurando imagens PNG na pasta dcr/hof_furni...');
    const pngFiles = findPngFiles('public/handitems/dcr/hof_furni');
    
    if (pngFiles.length > 0) {
      console.log(`✅ Encontradas ${pngFiles.length} imagens PNG!`);
      await copyHanditemImages(pngFiles, imagesDir);
    } else {
      console.log('⚠️ Nenhuma imagem PNG encontrada na pasta dcr/hof_furni');
    }
    
    // 4. Criar imagens placeholder baseadas nos handitems conhecidos
    console.log('🎨 Criando imagens placeholder...');
    await createPlaceholderImages(imagesDir);
    
    // 5. Criar mapeamento de handitems
    console.log('📝 Criando mapeamento de handitems...');
    await createHanditemMapping(imagesDir);
    
    console.log('✅ EXTRAÇÃO ALTERNATIVA CONCLUÍDA!');
    console.log(`📁 Imagens salvas em: ${imagesDir}`);
    
  } catch (error) {
    console.error('❌ ERRO na extração alternativa:', error.message);
    process.exit(1);
  }
}

function findPngFiles(dir) {
  const pngFiles = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        pngFiles.push(...findPngFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.png')) {
        pngFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Ignorar erros de diretório
  }
  
  return pngFiles;
}

async function copyHanditemImages(pngFiles, imagesDir) {
  console.log('📁 Copiando imagens PNG encontradas...');
  
  for (const pngFile of pngFiles) {
    const fileName = path.basename(pngFile);
    
    // Determinar tipo baseado no nome do arquivo
    let targetDir = path.join(imagesDir, 'preview');
    
    if (fileName.toLowerCase().includes('drk') || fileName.toLowerCase().includes('use')) {
      targetDir = path.join(imagesDir, 'drk');
    } else if (fileName.toLowerCase().includes('crr') || fileName.toLowerCase().includes('carry')) {
      targetDir = path.join(imagesDir, 'crr');
    }
    
    // Copiar arquivo
    const targetPath = path.join(targetDir, fileName);
    try {
      fs.copyFileSync(pngFile, targetPath);
      console.log(`  📁 Copiado: ${fileName} → ${path.basename(targetDir)}/`);
    } catch (error) {
      console.log(`  ⚠️ Erro ao copiar ${fileName}: ${error.message}`);
    }
  }
}

async function createPlaceholderImages(imagesDir) {
  console.log('🎨 Criando imagens placeholder para handitems...');
  
  try {
    // Ler lista de handitems
    const handitemsFile = path.join(process.cwd(), 'public', 'handitems', 'handitems.json');
    const handitems = JSON.parse(fs.readFileSync(handitemsFile, 'utf-8'));
    
    // Criar imagem placeholder simples (SVG)
    const createPlaceholderSvg = (id, name) => {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>
  <text x="32" y="20" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">${id}</text>
  <text x="32" y="35" text-anchor="middle" font-family="Arial" font-size="6" fill="#999">${name.substring(0, 8)}</text>
  <circle cx="32" cy="45" r="8" fill="#ddd" stroke="#bbb" stroke-width="1"/>
</svg>`;
    };
    
    // Criar placeholders para alguns handitems importantes
    const importantHanditems = handitems.filter(h => 
      h.id <= 50 || h.name.toLowerCase().includes('sorvete') || 
      h.name.toLowerCase().includes('café') || h.name.toLowerCase().includes('água')
    );
    
    for (const handitem of importantHanditems.slice(0, 20)) {
      const svgContent = createPlaceholderSvg(handitem.id, handitem.name);
      const svgPath = path.join(imagesDir, 'preview', `handitem_${handitem.id}.svg`);
      
      try {
        fs.writeFileSync(svgPath, svgContent);
        console.log(`  🎨 Criado placeholder: handitem_${handitem.id}.svg`);
      } catch (error) {
        console.log(`  ⚠️ Erro ao criar placeholder para ${handitem.id}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Erro ao criar placeholders:', error.message);
  }
}

async function createHanditemMapping(imagesDir) {
  try {
    // Ler lista de handitems
    const handitemsFile = path.join(process.cwd(), 'public', 'handitems', 'handitems.json');
    const handitems = JSON.parse(fs.readFileSync(handitemsFile, 'utf-8'));
    
    // Criar mapeamento
    const mapping = {
      handitems: handitems,
      images: {
        drk: [],
        crr: [],
        preview: []
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Mapear imagens encontradas
    ['drk', 'crr', 'preview'].forEach(type => {
      const typeDir = path.join(imagesDir, type);
      if (fs.existsSync(typeDir)) {
        const files = fs.readdirSync(typeDir);
        mapping.images[type] = files.filter(f => 
          f.endsWith('.png') || f.endsWith('.gif') || f.endsWith('.jpg') || f.endsWith('.svg')
        );
      }
    });
    
    // Salvar mapeamento
    const mappingFile = path.join(imagesDir, 'handitem-mapping.json');
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log(`💾 Mapeamento salvo em: ${mappingFile}`);
    
    // Estatísticas
    const totalImages = mapping.images.drk.length + mapping.images.crr.length + mapping.images.preview.length;
    console.log(`📊 Estatísticas:`);
    console.log(`  - Total de handitems: ${handitems.length}`);
    console.log(`  - Imagens drk (UseItem): ${mapping.images.drk.length}`);
    console.log(`  - Imagens crr (CarryItem): ${mapping.images.crr.length}`);
    console.log(`  - Imagens preview: ${mapping.images.preview.length}`);
    console.log(`  - Total de imagens: ${totalImages}`);
    
  } catch (error) {
    console.error('Erro ao criar mapeamento:', error.message);
  }
}

// Executar extração alternativa
extractHanditemImagesAlternative();
