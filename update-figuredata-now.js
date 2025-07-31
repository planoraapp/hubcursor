// Executar atualização imediata do figuredata.json
import { parseStringPromise } from 'xml2js';
import fs from 'fs/promises';

async function run() {
  console.log('🚀 Obtendo dados oficiais do habbo-downloader...');
  
  try {
    // Usar dados oficiais do GitHub habbo-downloader
    const response = await fetch('https://raw.githubusercontent.com/higoka/habbo-downloader/main/resource/gamedata/figuredata.xml');
    
    if (!response.ok) {
      throw new Error('Falha ao baixar dados oficiais');
    }
    
    const xmlContent = await response.text();
    console.log('✅ XML obtido do habbo-downloader');
    
    const raw = await parseStringPromise(xmlContent, {
      explicitArray: false,
      mergeAttrs: true
    });
    
    const result = {};
    
    if (raw.figuredata && raw.figuredata.settype) {
      const settypes = Array.isArray(raw.figuredata.settype) ? raw.figuredata.settype : [raw.figuredata.settype];
      
      settypes.forEach(settype => {
        const type = settype.type; 
        const sets = Array.isArray(settype.set) ? settype.set : [settype.set];
        
        result[type] = sets
          .filter(s => s && s.selectable === '1')
          .map(s => ({
            id: s.id,
            gender: s.gender || 'U',
            club: s.club || '0',
            colorable: s.colorable === '1',
            colors: s.color
              ? (Array.isArray(s.color) ? s.color.map(c => c.id) : [s.color.id])
              : ['1']
          }));
      });
    }
    
    // Salvar dados oficiais
    await fs.writeFile('public/figuredata.json', JSON.stringify(result, null, 2));
    
    const totalItems = Object.values(result).reduce((acc, items) => acc + items.length, 0);
    console.log(`✅ Dados oficiais salvos! ${Object.keys(result).length} tipos, ${totalItems} itens`);
    
    // Mostrar algumas categorias para verificação
    console.log('📊 Categorias principais:');
    ['hd', 'hr', 'ch', 'lg', 'sh', 'ha'].forEach(type => {
      if (result[type]) {
        console.log(`   ${type}: ${result[type].length} itens`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

run();