const fs = require('fs');
const path = require('path');

console.log('🔍 Testando imagens extraídas...\n');

// Verificar se as imagens extraídas existem
const extractedDir = path.join(__dirname, 'public', 'handitems', 'images', 'extracted');
const drkDir = path.join(__dirname, 'public', 'handitems', 'images', 'drk');
const crrDir = path.join(__dirname, 'public', 'handitems', 'images', 'crr');
const previewDir = path.join(__dirname, 'public', 'handitems', 'images', 'preview');

console.log('📁 Verificando diretórios:');
console.log(`   Extracted: ${fs.existsSync(extractedDir) ? '✅' : '❌'}`);
console.log(`   DRK: ${fs.existsSync(drkDir) ? '✅' : '❌'}`);
console.log(`   CRR: ${fs.existsSync(crrDir) ? '✅' : '❌'}`);
console.log(`   Preview: ${fs.existsSync(previewDir) ? '✅' : '❌'}`);

// Verificar imagens extraídas
if (fs.existsSync(extractedDir)) {
  const extractedFiles = fs.readdirSync(extractedDir);
  console.log(`\n📊 Imagens extraídas encontradas: ${extractedFiles.length}`);
  
  // Mostrar algumas imagens de exemplo
  const svgFiles = extractedFiles.filter(f => f.endsWith('.svg'));
  console.log(`   SVG files: ${svgFiles.length}`);
  
  if (svgFiles.length > 0) {
    console.log('   Exemplos:');
    svgFiles.slice(0, 5).forEach(file => {
      console.log(`     - ${file}`);
    });
  }
}

// Verificar imagens DRK
if (fs.existsSync(drkDir)) {
  const drkFiles = fs.readdirSync(drkDir);
  console.log(`\n📊 Imagens DRK encontradas: ${drkFiles.length}`);
  
  if (drkFiles.length > 0) {
    console.log('   Exemplos:');
    drkFiles.slice(0, 5).forEach(file => {
      console.log(`     - ${file}`);
    });
  }
}

// Verificar imagens CRR
if (fs.existsSync(crrDir)) {
  const crrFiles = fs.readdirSync(crrDir);
  console.log(`\n📊 Imagens CRR encontradas: ${crrFiles.length}`);
  
  if (crrFiles.length > 0) {
    console.log('   Exemplos:');
    crrFiles.slice(0, 5).forEach(file => {
      console.log(`     - ${file}`);
    });
  }
}

// Verificar imagens Preview
if (fs.existsSync(previewDir)) {
  const previewFiles = fs.readdirSync(previewDir);
  console.log(`\n📊 Imagens Preview encontradas: ${previewFiles.length}`);
  
  if (previewFiles.length > 0) {
    console.log('   Exemplos:');
    previewFiles.slice(0, 5).forEach(file => {
      console.log(`     - ${file}`);
    });
  }
}

// Verificar arquivo de mapeamento
const mappingFile = path.join(__dirname, 'public', 'handitems', 'images', 'handitem-mapping.json');
if (fs.existsSync(mappingFile)) {
  try {
    const mappingData = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    console.log(`\n📋 Mapeamento encontrado: ${mappingData.handitems?.length || 0} handitems`);
    
    if (mappingData.handitems) {
      const withImages = mappingData.handitems.filter(item => item.hasImage);
      console.log(`   Com imagens: ${withImages.length}`);
      
      if (withImages.length > 0) {
        console.log('   Exemplos com imagens:');
        withImages.slice(0, 5).forEach(item => {
          console.log(`     - ID ${item.id}: ${item.name} (${item.imagePath})`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao ler mapeamento: ${error.message}`);
  }
} else {
  console.log('\n❌ Arquivo de mapeamento não encontrado');
}

console.log('\n🎯 Teste concluído!');
