// scripts/extract-handitem-images.js - Script para extrair imagens dos handitems usando habbo-downloader
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

async function extractHanditemImages() {
  console.log('🚀 Extraindo imagens dos handitems usando habbo-downloader...');
  
  try {
    // Verificar se habbo-downloader está instalado
    console.log('🔍 Verificando se habbo-downloader está instalado...');
    try {
      execSync('habbo-downloader --version', { stdio: 'pipe' });
      console.log('✅ habbo-downloader já está instalado!');
    } catch (error) {
      console.log('📦 Instalando habbo-downloader...');
      execSync('npm install -g habbo-downloader', { stdio: 'inherit' });
      console.log('✅ habbo-downloader instalado com sucesso!');
    }
    
    // Criar diretório para assets de handitems
    const handitemsDir = path.join(process.cwd(), 'public', 'handitems');
    await fs.mkdir(handitemsDir, { recursive: true });
    
    console.log('⬇️ Baixando arquivos Gordon (incluindo SWF dos handitems)...');
    // Baixar arquivos Gordon que contêm os SWF dos handitems
    execSync(`hdl -c gordon -d com.br -o "${handitemsDir}"`, { stdio: 'inherit' });
    
    console.log('⬇️ Baixando dados do jogo (external_flash_texts)...');
    // Baixar external_flash_texts para obter nomes dos handitems
    execSync(`hdl -c gamedata -d com.br -o "${handitemsDir}"`, { stdio: 'inherit' });
    
    console.log('⬇️ Baixando mobílias (que podem dar handitems)...');
    // Baixar mobílias que podem dar handitems
    execSync(`hdl -c furnitures -d com.br -o "${handitemsDir}"`, { stdio: 'inherit' });
    
    // Procurar arquivos SWF de handitems
    console.log('🔍 Procurando arquivos SWF de handitems...');
    const gordonDir = path.join(handitemsDir, 'gordon');
    const swfFiles = await findSwfFiles(gordonDir);
    
    console.log(`📁 Encontrados ${swfFiles.length} arquivos SWF:`);
    swfFiles.forEach(file => console.log(`  - ${file}`));
    
    // Procurar especificamente por hh_human_item.swf
    const humanItemSwf = swfFiles.find(file => file.includes('hh_human_item'));
    if (humanItemSwf) {
      console.log(`✅ Arquivo hh_human_item.swf encontrado: ${humanItemSwf}`);
      
      // Criar diretório para imagens extraídas
      const imagesDir = path.join(handitemsDir, 'images');
      await fs.mkdir(imagesDir, { recursive: true });
      
      console.log('📸 Extraindo imagens dos handitems...');
      // Aqui você precisaria de uma ferramenta para extrair imagens do SWF
      // Por enquanto, vamos listar o que foi baixado
      await listDownloadedAssets(handitemsDir);
      
    } else {
      console.log('⚠️ Arquivo hh_human_item.swf não encontrado nos arquivos baixados');
      console.log('📁 Arquivos SWF disponíveis:');
      swfFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
    }
    
    // Procurar external_flash_texts para obter nomes dos handitems
    console.log('🔍 Procurando external_flash_texts...');
    const gameDataDir = path.join(handitemsDir, 'gamedata');
    const flashTextsFile = await findFlashTextsFile(gameDataDir);
    
    if (flashTextsFile) {
      console.log(`✅ external_flash_texts encontrado: ${flashTextsFile}`);
      await extractHanditemNames(flashTextsFile, handitemsDir);
    } else {
      console.log('⚠️ external_flash_texts não encontrado');
    }
    
    console.log('✅ Extração de handitems concluída!');
    console.log(`📁 Arquivos salvos em: ${handitemsDir}`);
    
  } catch (error) {
    console.error('❌ Erro ao extrair imagens dos handitems:', error.message);
    process.exit(1);
  }
}

async function findSwfFiles(dir) {
  const swfFiles = [];
  
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        const subFiles = await findSwfFiles(fullPath);
        swfFiles.push(...subFiles);
      } else if (item.isFile() && item.name.endsWith('.swf')) {
        swfFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar arquivos SWF em ${dir}:`, error.message);
  }
  
  return swfFiles;
}

async function findFlashTextsFile(dir) {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        const found = await findFlashTextsFile(fullPath);
        if (found) return found;
      } else if (item.name.includes('external_flash_texts')) {
        return fullPath;
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar external_flash_texts em ${dir}:`, error.message);
  }
  
  return null;
}

async function extractHanditemNames(flashTextsFile, outputDir) {
  try {
    console.log('📝 Extraindo nomes dos handitems...');
    const content = await fs.readFile(flashTextsFile, 'utf-8');
    
    // Buscar por handitems no formato handitemXXX=Nome
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
    
    // Salvar lista de handitems
    const handitemsFile = path.join(outputDir, 'handitems.json');
    await fs.writeFile(handitemsFile, JSON.stringify(handitems, null, 2));
    console.log(`💾 Lista de handitems salva em: ${handitemsFile}`);
    
  } catch (error) {
    console.error('Erro ao extrair nomes dos handitems:', error.message);
  }
}

async function listDownloadedAssets(dir) {
  try {
    console.log('📁 Assets baixados:');
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        console.log(`  📁 ${item.name}/`);
        const subItems = await fs.readdir(fullPath, { withFileTypes: true });
        subItems.slice(0, 5).forEach(subItem => {
          console.log(`    - ${subItem.name}`);
        });
        if (subItems.length > 5) {
          console.log(`    ... e mais ${subItems.length - 5} arquivos`);
        }
      } else {
        console.log(`  📄 ${item.name}`);
      }
    }
  } catch (error) {
    console.error('Erro ao listar assets:', error.message);
  }
}

extractHanditemImages();
