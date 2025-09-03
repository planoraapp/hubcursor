// scripts/fetch-habbo-data.js - Script para obter dados oficiais usando habbo-downloader
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

async function fetchOfficialHabboData() {
  console.log('🚀 Obtendo dados oficiais do Habbo usando habbo-downloader...');
  
  try {
    // Instalar habbo-downloader temporariamente
    console.log('📦 Instalando habbo-downloader...');
    execSync('npm install -g habbo-downloader', { stdio: 'inherit' });
    
    // Criar diretório temporário
    const tempDir = path.join(process.cwd(), 'temp-habbo-data');
    await fs.mkdir(tempDir, { recursive: true });
    
    console.log('⬇️ Baixando gamedata oficial...');
    // Baixar gamedata oficial (inclui figuredata.xml)
    execSync(`hdl -c gamedata -o "${tempDir}"`, { stdio: 'inherit' });
    
    console.log('⬇️ Baixando clothes oficial...');
    // Baixar dados de roupas oficiais
    execSync(`hdl -c clothes -o "${tempDir}"`, { stdio: 'inherit' });
    
    // Procurar arquivo figuredata.xml no diretório baixado
    const gameDataPath = path.join(tempDir, 'gamedata');
    const figureDataPath = path.join(gameDataPath, 'figuredata.xml');
    
    console.log('🔍 Procurando figuredata.xml...');
    const files = await fs.readdir(gameDataPath, { recursive: true });
    console.log('📁 Arquivos encontrados:', files);
    
    // Se encontrou o XML, processar
    if (await fs.access(figureDataPath).then(() => true).catch(() => false)) {
      console.log('✅ figuredata.xml encontrado! Processando...');
      
      const { parseStringPromise } = await import('xml2js');
      const xmlContent = await fs.readFile(figureDataPath, 'utf-8');
      
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
      
      // Salvar figuredata.json processado
      const outputPath = path.join(process.cwd(), 'public', 'figuredata.json');
      await fs.writeFile(
        outputPath,
        JSON.stringify(result, null, 2),
        'utf-8'
      );
      
      console.log('✅ figuredata.json oficial gerado!');
      console.log(`📊 Tipos encontrados: ${Object.keys(result).length}`);
      Object.keys(result).forEach(type => {
        console.log(`   ${type}: ${result[type].length} itens`);
      });
    }
    
    // Limpar diretório temporário
    await fs.rm(tempDir, { recursive: true, force: true });
    
    console.log('🎉 Dados oficiais do Habbo obtidos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao obter dados oficiais:', error.message);
    
    // Fallback: usar dados diretos do GitHub habbo-downloader
    console.log('🔄 Tentando usar dados do GitHub habbo-downloader...');
    await fetchFromGitHub();
  }
}

async function fetchFromGitHub() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/higoka/habbo-downloader/main/resource/gamedata/figuredata.xml');
    
    if (!response.ok) {
      throw new Error('Falha ao baixar do GitHub');
    }
    
    const xmlContent = await response.text();
    const { parseStringPromise } = await import('xml2js');
    
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
    
    const outputPath = path.join(process.cwd(), 'public', 'figuredata.json');
    await fs.writeFile(
      outputPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    console.log('✅ Dados oficiais obtidos do GitHub!');
    console.log(`📊 Tipos encontrados: ${Object.keys(result).length}`);
    
  } catch (error) {
    console.error('❌ Erro ao obter dados do GitHub:', error.message);
    process.exit(1);
  }
}

fetchOfficialHabboData();