
// scripts/build-figuredata.js
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import fs from 'fs/promises';

async function buildFigureData() {
  console.log('🚀 Iniciando geração do figuredata.json...');
  
  try {
    console.log('📡 Buscando figuredata.xml do Habbo Brasil...');
    const { data: xml } = await axios.get(
      'https://www.habbo.com.br/gamedata/figuredata.xml',
      { responseType: 'text' }
    );

    console.log('🔄 Parseando XML...');
    const raw = await parseStringPromise(xml, {
      explicitArray: false,
      mergeAttrs: true
    });

    console.log('🎯 Processando dados...');
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

    // Criar diretório public se não existir
    try {
      await fs.access('./public');
    } catch {
      await fs.mkdir('./public', { recursive: true });
    }

    await fs.writeFile(
      './public/figuredata.json',
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    console.log('✅ figuredata.json gerado em public/');
    console.log(`📊 Tipos encontrados: ${Object.keys(result).length}`);
    Object.keys(result).forEach(type => {
      console.log(`   ${type}: ${result[type].length} itens`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar figuredata:', error);
    process.exit(1);
  }
}

buildFigureData();
