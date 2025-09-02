
// scripts/build-figuredata.js
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import fs from 'fs/promises';
import path from 'path';

async function buildFigureData() {
  console.log('🚀 Iniciando geração do figuredata.json...');
  
  try {
    console.log('📡 Buscando figuredata.xml do Habbo Brasil...');
    const { data: xml } = await axios.get(
      'https://www.habbo.com.br/gamedata/figuredata.xml',
      { 
        responseType: 'text',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
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
    const publicDir = path.join(process.cwd(), 'public');
    try {
      await fs.access(publicDir);
    } catch {
      console.log('📁 Criando diretório public...');
      await fs.mkdir(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'figuredata.json');
    await fs.writeFile(
      outputPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    console.log('✅ figuredata.json gerado em public/');
    console.log(`📊 Tipos encontrados: ${Object.keys(result).length}`);
    Object.keys(result).forEach(type => {
      console.log(`   ${type}: ${result[type].length} itens`);
    });
    
    console.log('🎉 Processo concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao gerar figuredata:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('   → Problema de conectividade. Verifique sua internet.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Timeout na requisição. Tente novamente.');
    }
    process.exit(1);
  }
}

buildFigureData();
