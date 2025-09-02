// Script Node.js para processar dados extraídos do HabboTemplarios
// Execute: node processar-dados-templarios.js

const fs = require('fs');
const path = require('path');

console.log('🔄 Processando dados do HabboTemplarios...');

// Função para processar dados
function processTemplariosData() {
  try {
    // Ler arquivo extraído
    const dataPath = path.join(__dirname, 'habboTemplariosData-completo.ts');
    
    if (!fs.existsSync(dataPath)) {
      console.log('❌ Arquivo habboTemplariosData-completo.ts não encontrado');
      console.log('�� Execute primeiro o script de extração no navegador');
      return;
    }
    
    const content = fs.readFileSync(dataPath, 'utf8');
    console.log('✅ Arquivo lido com sucesso');
    
    // Extrair JSON do arquivo TypeScript
    const palettesMatch = content.match(/export const palettesJSON[^=]*=\s*({[\s\S]*?});/);
    const setsMatch = content.match(/export const setsJSON[^=]*=\s*(\[[\s\S]*?\]);/);
    
    if (!palettesMatch || !setsMatch) {
      console.log('❌ Não foi possível extrair dados do arquivo');
      return;
    }
    
    const palettesJSON = JSON.parse(palettesMatch[1]);
    const setsJSON = JSON.parse(setsMatch[1]);
    
    console.log('✅ Dados extraídos e parseados');
    
    // Processar estatísticas
    const stats = {
      totalItems: 0,
      categories: {},
      palettes: Object.keys(palettesJSON).length
    };
    
    setsJSON.forEach(categorySet => {
      const category = categorySet.type;
      const itemCount = Object.keys(categorySet.sets).length;
      stats.categories[category] = itemCount;
      stats.totalItems += itemCount;
    });
    
    console.log('📊 Estatísticas:');
    console.log(`- Total de itens: ${stats.totalItems}`);
    console.log(`- Total de categorias: ${Object.keys(stats.categories).length}`);
    console.log(`- Total de paletas: ${stats.palettes}`);
    console.log('\n📋 Itens por categoria:');
    Object.entries(stats.categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} itens`);
    });
    
    // Gerar arquivo otimizado
    const optimizedData = {
      palettes: palettesJSON,
      sets: setsJSON,
      stats: stats,
      generatedAt: new Date().toISOString()
    };
    
    // Salvar arquivo otimizado
    const outputPath = path.join(__dirname, 'src', 'data', 'habboTemplariosData-completo.json');
    fs.writeFileSync(outputPath, JSON.stringify(optimizedData, null, 2));
    
    console.log(`✅ Arquivo otimizado salvo em: ${outputPath}`);
    
    // Gerar arquivo TypeScript atualizado
    const tsContent = `// Dados completos do HabboTemplarios
// Extraído em: ${stats.generatedAt}
// Total: ${stats.totalItems} itens em ${Object.keys(stats.categories).length} categorias

export interface HabboPaletteColor {
  index: number;
  club: number;
  selectable: number;
  hex: string;
}

export interface HabboPalette {
  [colorId: string]: HabboPaletteColor;
}

expor
