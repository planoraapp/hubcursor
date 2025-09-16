// scripts/extract-handitem-images-from-swf.cjs - Script para extrair imagens dos handitems do SWF
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function extractHanditemImagesFromSwf() {
  console.log('🚀 EXTRAINDO IMAGENS DOS HANDITEMS DO SWF...');
  
  try {
    // 1. Encontrar arquivo SWF dos handitems
    console.log('🔍 Procurando arquivo SWF dos handitems...');
    const swfFiles = findSwfFiles('public/handitems');
    const handitemSwf = swfFiles.find(f => f.includes('handitem_tester') || f.includes('hh_human_item'));
    
    if (!handitemSwf) {
      console.log('❌ Arquivo SWF dos handitems não encontrado!');
      console.log('📁 Arquivos SWF disponíveis:');
      swfFiles.slice(0, 10).forEach(f => console.log(`  - ${path.basename(f)}`));
      return;
    }
    
    console.log(`✅ Arquivo SWF encontrado: ${handitemSwf}`);
    
    // 2. Criar diretório para imagens extraídas
    const imagesDir = path.join(process.cwd(), 'public', 'handitems', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('📁 Diretório criado: public/handitems/images');
    }
    
    // 3. Criar subdiretórios
    const drkDir = path.join(imagesDir, 'drk');
    const crrDir = path.join(imagesDir, 'crr');
    const previewDir = path.join(imagesDir, 'preview');
    
    [drkDir, crrDir, previewDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // 4. Verificar se JPEXS está disponível
    console.log('🔧 Verificando JPEXS Free Flash Decompiler...');
    const jpexsPath = findJpexsPath();
    
    if (!jpexsPath) {
      console.log('⚠️ JPEXS Free Flash Decompiler não encontrado!');
      console.log('📥 Baixe em: https://www.free-decompiler.com/flash/');
      console.log('📁 Instale e execute manualmente:');
      console.log(`   1. Abra: ${handitemSwf}`);
      console.log(`   2. Exporte todas as imagens para: ${imagesDir}`);
      console.log('   3. Organize as imagens em subdiretórios drk/, crr/, preview/');
      return;
    }
    
    console.log(`✅ JPEXS encontrado: ${jpexsPath}`);
    
    // 5. Extrair imagens usando JPEXS
    console.log('📸 Extraindo imagens do SWF...');
    try {
      execSync(`"${jpexsPath}" -export "${handitemSwf}" -format png -output "${imagesDir}"`, { stdio: 'inherit' });
      console.log('✅ Imagens extraídas com sucesso!');
    } catch (error) {
      console.log('⚠️ Erro ao extrair com JPEXS via linha de comando');
      console.log('📝 Execute manualmente:');
      console.log(`   1. Abra JPEXS Free Flash Decompiler`);
      console.log(`   2. Abra o arquivo: ${handitemSwf}`);
      console.log(`   3. Vá em File > Export > Export all parts`);
      console.log(`   4. Selecione apenas "Images" formato "PNG/GIF/JPEG"`);
      console.log(`   5. Salve em: ${imagesDir}`);
    }
    
    // 6. Organizar imagens por tipo
    console.log('📁 Organizando imagens por tipo...');
    await organizeImages(imagesDir);
    
    // 7. Criar mapeamento de handitems
    console.log('📝 Criando mapeamento de handitems...');
    await createHanditemMapping(imagesDir);
    
    console.log('✅ EXTRAÇÃO CONCLUÍDA!');
    console.log(`📁 Imagens salvas em: ${imagesDir}`);
    
  } catch (error) {
    console.error('❌ ERRO na extração:', error.message);
    process.exit(1);
  }
}

function findSwfFiles(dir) {
  const swfFiles = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        swfFiles.push(...findSwfFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.swf')) {
        swfFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Ignorar erros de diretório
  }
  
  return swfFiles;
}

function findJpexsPath() {
  const possiblePaths = [
    'C:\\Program Files\\JPEXS Free Flash Decompiler\\ffdec.exe',
    'C:\\Program Files (x86)\\JPEXS Free Flash Decompiler\\ffdec.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\JPEXS Free Flash Decompiler\\ffdec.exe',
    'ffdec.exe' // Se estiver no PATH
  ];
  
  for (const jpexsPath of possiblePaths) {
    try {
      execSync(`"${jpexsPath}" --version`, { stdio: 'pipe' });
      return jpexsPath;
    } catch (error) {
      // Continuar procurando
    }
  }
  
  return null;
}

async function organizeImages(imagesDir) {
  try {
    const files = fs.readdirSync(imagesDir);
    
    for (const file of files) {
      const fullPath = path.join(imagesDir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && (file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.jpg'))) {
        let targetDir = previewDir;
        
        // Determinar tipo baseado no nome do arquivo
        if (file.toLowerCase().includes('drk')) {
          targetDir = path.join(imagesDir, 'drk');
        } else if (file.toLowerCase().includes('crr')) {
          targetDir = path.join(imagesDir, 'crr');
        }
        
        // Mover arquivo para diretório correto
        const targetPath = path.join(targetDir, file);
        if (fullPath !== targetPath) {
          fs.renameSync(fullPath, targetPath);
          console.log(`  📁 Movido: ${file} → ${path.basename(targetDir)}/`);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao organizar imagens:', error.message);
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
          f.endsWith('.png') || f.endsWith('.gif') || f.endsWith('.jpg')
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

// Executar extração
extractHanditemImagesFromSwf();
