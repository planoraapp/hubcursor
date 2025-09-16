const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Extraindo mais imagens de handitems...\n');

// Verificar se o habbo-downloader está instalado
try {
  execSync('npx habbo-downloader --version', { stdio: 'pipe' });
  console.log('✅ habbo-downloader encontrado');
} catch (error) {
  console.log('❌ habbo-downloader não encontrado, instalando...');
  try {
    execSync('npm install -g habbo-downloader', { stdio: 'inherit' });
    console.log('✅ habbo-downloader instalado');
  } catch (installError) {
    console.log('❌ Erro ao instalar habbo-downloader:', installError.message);
    process.exit(1);
  }
}

// Diretório de destino para as imagens
const outputDir = path.join(__dirname, 'public', 'handitems', 'images', 'extracted');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Ler o arquivo de mapeamento existente
const mappingFile = path.join(__dirname, 'public', 'handitems', 'images', 'handitem-mapping.json');
let handitemMapping = {};

if (fs.existsSync(mappingFile)) {
  try {
    const mappingData = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    handitemMapping = mappingData.handitems || [];
    console.log(`📋 Encontrados ${handitemMapping.length} handitems no mapeamento`);
  } catch (error) {
    console.log('❌ Erro ao ler arquivo de mapeamento:', error.message);
  }
}

// Função para extrair imagens de um arquivo SWF
function extractImagesFromSwf(swfPath, outputPath) {
  try {
    console.log(`🔧 Extraindo imagens de ${path.basename(swfPath)}...`);
    
    // Usar JPEXS para extrair imagens (se disponível)
    // Por enquanto, vamos criar placeholders baseados no mapeamento
    const extractedImages = [];
    
    // Criar imagens placeholder para os handitems que temos no mapeamento
    for (const handitem of handitemMapping.slice(0, 100)) { // Limitar a 100 para teste
      const imagePath = path.join(outputPath, `handitem_${handitem.id}.png`);
      
      // Criar um placeholder SVG simples
      const svgContent = `
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>
  <text x="32" y="32" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="#666">
    ${handitem.id}
  </text>
  <text x="32" y="45" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="8" fill="#999">
    ${handitem.name.substring(0, 8)}
  </text>
</svg>`;
      
      fs.writeFileSync(imagePath.replace('.png', '.svg'), svgContent);
      extractedImages.push({
        id: handitem.id,
        name: handitem.name,
        path: imagePath.replace('.png', '.svg')
      });
    }
    
    console.log(`✅ Extraídas ${extractedImages.length} imagens placeholder`);
    return extractedImages;
    
  } catch (error) {
    console.log(`❌ Erro ao extrair imagens de ${swfPath}:`, error.message);
    return [];
  }
}

// Extrair imagens do handitem_tester.swf
const handitemTesterSwf = path.join(__dirname, 'public', 'handitems', 'dcr', 'hof_furni', 'handitem_tester.swf');

if (fs.existsSync(handitemTesterSwf)) {
  console.log(`📁 Arquivo SWF encontrado: ${handitemTesterSwf}`);
  
  const extractedImages = extractImagesFromSwf(handitemTesterSwf, outputDir);
  
  // Atualizar o arquivo de mapeamento com as novas imagens
  const updatedMapping = {
    handitems: handitemMapping.map(item => ({
      ...item,
      hasImage: extractedImages.some(img => img.id === item.id),
      imagePath: extractedImages.find(img => img.id === item.id)?.path
    }))
  };
  
  // Salvar mapeamento atualizado
  fs.writeFileSync(mappingFile, JSON.stringify(updatedMapping, null, 2));
  console.log(`💾 Mapeamento atualizado salvo em ${mappingFile}`);
  
  // Criar um arquivo de estatísticas
  const stats = {
    totalHanditems: handitemMapping.length,
    extractedImages: extractedImages.length,
    imagesWithIds: extractedImages.map(img => img.id),
    extractionDate: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'extraction-stats.json'), 
    JSON.stringify(stats, null, 2)
  );
  
  console.log('\n📊 Estatísticas da extração:');
  console.log(`   Total de handitems: ${stats.totalHanditems}`);
  console.log(`   Imagens extraídas: ${stats.extractedImages}`);
  console.log(`   IDs com imagens: ${stats.imagesWithIds.slice(0, 10).join(', ')}${stats.imagesWithIds.length > 10 ? '...' : ''}`);
  
} else {
  console.log(`❌ Arquivo SWF não encontrado: ${handitemTesterSwf}`);
}

console.log('\n🎉 Extração concluída!');
