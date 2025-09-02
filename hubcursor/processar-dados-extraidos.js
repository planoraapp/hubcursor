// Script para processar os dados extraídos do HabboTemplarios
// Execute este script no console do navegador após a extração

(function() {
  console.log('🔄 Processando dados extraídos...');
  
  // Recuperar dados do localStorage
  const rawData = localStorage.getItem('habboTemplariosData');
  
  if (!rawData) {
    console.log('❌ Dados não encontrados no localStorage');
    return;
  }
  
  const data = JSON.parse(rawData);
  console.log('✅ Dados recuperados do localStorage');
  
  // Processar e organizar dados
  const processedData = {
    palettes: data.palettesJSON,
    sets: data.setsJSON,
    stats: data.stats,
    generatedAt: new Date().toISOString()
  };
  
  console.log('📊 Estatísticas finais:');
  console.log(`- Total de itens: ${processedData.stats.totalItems}`);
  console.log(`- Total de categorias: ${Object.keys(processedData.stats.categories).length}`);
  console.log(`- Total de paletas: ${Object.keys(processedData.palettes).length}`);
  
  console.log('\n📋 Itens por categoria:');
  Object.entries(processedData.stats.categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} itens`);
  });
  
  // Gerar código TypeScript
  const tsCode = `// Dados completos do HabboTemplarios
// Extraído em: ${processedData.generatedAt}
// Total: ${processedData.stats.totalItems} itens em ${Object.keys(processedData.stats.categories).length} categorias

export interface HabboPaletteColor {
  index: number;
  club: number;
  selectable: number;
  hex: string;
}

export interface HabboPalette {
  [colorId: string]: HabboPaletteColor;
}

export interface HabboSetData {
  gender: 'M' | 'F' | 'U';
  club: number;
  colorable: number;
  selectable: number;
  preselectable: number;
  sellable?: number;
  duotone?: number;
  nft?: number;
}

export interface HabboFigureSet {
  paletteid: number;
  type: string;
  sets: { [setId: string]: HabboSetData };
}

export const palettesJSON: { [paletteId: string]: HabboPalette } = ${JSON.stringify(processedData.palettes, null, 2)};

export const setsJSON: HabboFigureSet[] = ${JSON.stringify(processedData.sets, null, 2)};

// Estatísticas
export const clothingStats = {
  totalItems: ${processedData.stats.totalItems},
  totalCategories: ${Object.keys(processedData.stats.categories).length},
  totalPalettes: ${Object.keys(processedData.palettes).length},
  categories: ${JSON.stringify(processedData.stats.categories, null, 2)},
  generatedAt: '${processedData.generatedAt}'
};`;
  
  // Fazer download do arquivo
  const blob = new Blob([tsCode], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'habboTemplariosData-completo.ts';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ Arquivo habboTemplariosData-completo.ts baixado!');
  console.log('🎉 Processamento concluído com sucesso!');
  
  return processedData;
})();
