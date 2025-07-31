const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

const SOURCES = [
  {
    name: 'Habbo-Downloader GitHub',
    url: 'https://raw.githubusercontent.com/higoka/habbo-downloader/main/resource/gamedata/figuredata.xml',
    type: 'xml'
  },
  {
    name: 'HabboAssets API',
    url: 'https://www.habboassets.com/gamedata/figuredata.xml',
    type: 'xml'
  },
  {
    name: 'Habbo Brasil Official',
    url: 'https://www.habbo.com.br/gamedata/figuredata.xml',
    type: 'xml'
  }
];

async function fetchFromSource(source) {
  console.log(`🌐 Tentando buscar dados de: ${source.name}`);
  
  try {
    const response = await axios.get(source.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'HabboHub-Editor/1.0'
      }
    });
    
    if (response.status === 200 && response.data) {
      console.log(`✅ Dados obtidos de ${source.name} (${response.data.length} bytes)`);
      return response.data;
    }
    
    throw new Error(`Status inválido: ${response.status}`);
  } catch (error) {
    console.error(`❌ Falha em ${source.name}:`, error.message);
    return null;
  }
}

async function parseXmlToJson(xmlData) {
  try {
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);
    
    const figureData = {};
    const settypes = result.figuredata.settypes.settype;
    
    // Garantir que seja um array
    const settypesArray = Array.isArray(settypes) ? settypes : [settypes];
    
    settypesArray.forEach(settype => {
      const type = settype.$.type;
      const sets = settype.set;
      
      figureData[type] = [];
      
      if (sets) {
        const setsArray = Array.isArray(sets) ? sets : [sets];
        
        setsArray.forEach(set => {
          const attrs = set.$;
          
          // Apenas itens selecionáveis
          if (attrs.selectable === '1') {
            const colors = [];
            
            if (set.color) {
              const colorArray = Array.isArray(set.color) ? set.color : [set.color];
              colorArray.forEach(color => {
                if (color.$) {
                  colors.push(color.$.id);
                }
              });
            }
            
            figureData[type].push({
              id: attrs.id,
              gender: attrs.gender || 'U',
              club: attrs.club || '0',
              colorable: attrs.colorable === '1',
              colors: colors.length > 0 ? colors : ['1']
            });
          }
        });
      }
    });
    
    return figureData;
  } catch (error) {
    console.error('❌ Erro ao processar XML:', error);
    throw error;
  }
}

function validateData(data) {
  const requiredTypes = ['hd', 'hr', 'ch', 'lg', 'sh', 'ha', 'ea', 'fa', 'cc', 'ca', 'wa'];
  const issues = [];
  
  // Verificar tipos obrigatórios
  requiredTypes.forEach(type => {
    if (!data[type] || data[type].length === 0) {
      issues.push(`Tipo '${type}' está vazio ou ausente`);
    }
  });
  
  // Verificar quantidade total de itens
  const totalItems = Object.values(data).reduce((acc, items) => acc + items.length, 0);
  if (totalItems < 500) {
    issues.push(`Apenas ${totalItems} itens encontrados (esperado: 500+)`);
  }
  
  // Verificar se há itens com IDs válidos
  const hasValidIds = Object.values(data).some(items => 
    items.some(item => item.id && item.id.length > 0)
  );
  
  if (!hasValidIds) {
    issues.push('Nenhum item com ID válido encontrado');
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Problemas encontrados na validação:', issues);
    return false;
  }
  
  console.log('✅ Validação passou:', {
    tipos: Object.keys(data).length,
    totalItens: totalItems,
    exemploIDs: Object.entries(data).slice(0, 3).map(([type, items]) => 
      `${type}: ${items.slice(0, 3).map(i => i.id).join(', ')}`
    )
  });
  
  return true;
}

async function fetchOfficialHabboData() {
  console.log('🚀 Iniciando busca por dados oficiais do Habbo...');
  
  let xmlData = null;
  let successSource = null;
  
  // Tentar cada fonte até encontrar uma que funcione
  for (const source of SOURCES) {
    xmlData = await fetchFromSource(source);
    if (xmlData) {
      successSource = source.name;
      break;
    }
  }
  
  if (!xmlData) {
    throw new Error('❌ Todas as fontes de dados falharam');
  }
  
  console.log(`🎯 Processando dados XML de: ${successSource}`);
  const figureData = await parseXmlToJson(xmlData);
  
  console.log('🔍 Validando dados...');
  const isValid = validateData(figureData);
  
  if (!isValid) {
    throw new Error('❌ Dados não passaram na validação');
  }
  
  // Adicionar metadados
  figureData._metadata = {
    source: successSource,
    fetchedAt: new Date().toISOString(),
    version: '1.0',
    totalItems: Object.values(figureData).reduce((acc, items) => acc + items.length, 0)
  };
  
  // Garantir que o diretório public existe
  const publicDir = path.join(process.cwd(), 'public');
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }
  
  // Salvar arquivo
  const outputPath = path.join(publicDir, 'figuredata.json');
  await fs.writeFile(outputPath, JSON.stringify(figureData, null, 2), 'utf8');
  
  console.log('🎉 Dados oficiais salvos com sucesso!');
  console.log('📊 Resumo:', {
    fonte: successSource,
    tipos: Object.keys(figureData).length - 1, // -1 para excluir _metadata
    totalItens: figureData._metadata.totalItems,
    arquivo: outputPath
  });
  
  return figureData;
}

// Executar script
if (require.main === module) {
  fetchOfficialHabboData()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { fetchOfficialHabboData };