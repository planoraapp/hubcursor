// scripts/update-figuredata.js - Atualizar com dados oficiais do habbo-downloader
import { parseStringPromise } from 'xml2js';
import fs from 'fs/promises';
import path from 'path';

async function updateFigureData() {
  console.log('🚀 Atualizando figuredata.json com dados oficiais...');
  
  try {
    // Tentar várias fontes oficiais
    const sources = [
      'https://raw.githubusercontent.com/higoka/habbo-downloader/main/resource/gamedata/figuredata.xml',
      'https://www.habbo.com/gamedata/figuredata.xml',
      'https://www.habbo.com.br/gamedata/figuredata.xml'
    ];
    
    let xmlContent = null;
    let usedSource = '';
    
    for (const source of sources) {
      try {
        console.log(`📡 Tentando baixar de: ${source}`);
        const response = await fetch(source, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          xmlContent = await response.text();
          usedSource = source;
          console.log(`✅ Dados obtidos de: ${source}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Falha em ${source}: ${error.message}`);
      }
    }
    
    if (!xmlContent) {
      throw new Error('Não foi possível obter dados de nenhuma fonte oficial');
    }
    
    console.log('🔄 Processando XML oficial...');
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
    
    // Validar dados
    const totalItems = Object.values(result).reduce((acc, items) => acc + items.length, 0);
    if (totalItems < 100) {
      throw new Error(`Dados insuficientes: apenas ${totalItems} itens encontrados`);
    }
    
    // Salvar arquivo atualizado
    const outputPath = path.join(process.cwd(), 'public', 'figuredata.json');
    await fs.writeFile(
      outputPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    console.log('✅ figuredata.json atualizado com dados oficiais!');
    console.log(`📊 Fonte: ${usedSource}`);
    console.log(`📊 Total de tipos: ${Object.keys(result).length}`);
    console.log(`📊 Total de itens: ${totalItems}`);
    
    // Mostrar detalhes por categoria
    Object.keys(result).forEach(type => {
      const items = result[type];
      const hcItems = items.filter(item => item.club === '1').length;
      const freeItems = items.filter(item => item.club === '0').length;
      console.log(`   ${type}: ${items.length} itens (${hcItems} HC + ${freeItems} gratuitos)`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar figuredata:', error.message);
    process.exit(1);
  }
}

// Executar automaticamente
updateFigureData().then(() => {
  console.log('🎉 Processo concluído!');
}).catch(error => {
  console.error('💥 Processo falhou:', error);
  process.exit(1);
});