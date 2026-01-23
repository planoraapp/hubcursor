/**
 * Script de sincronização diária de handitems
 * Busca external_flash_texts de múltiplos hotéis (.com, .com.br, .es)
 * e atualiza o arquivo handitems.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const HOTELS = {
  com: 'https://www.habbo.com',
  'com.br': 'https://www.habbo.com.br',
  es: 'https://www.habbo.es'
};

/**
 * Busca external_flash_texts de um hotel específico
 */
function fetchExternalFlashTexts(hotel) {
  return new Promise((resolve) => {
    try {
      const baseUrl = HOTELS[hotel];
      const url = new URL(`${baseUrl}/gamedata/external_flash_texts/1`);
      console.log(`📡 Buscando external_flash_texts de ${hotel}...`);
      
      const client = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': baseUrl
        },
        maxRedirects: 5
      };
      
      const makeRequest = (currentUrl, redirectCount = 0) => {
        if (redirectCount > 5) {
          console.error(`❌ Muitos redirecionamentos ao buscar de ${hotel}`);
          resolve([]);
          return;
        }

        const urlObj = new URL(currentUrl);
        const req = client.get({
          hostname: urlObj.hostname,
          path: urlObj.pathname,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': baseUrl
          }
        }, (res) => {
          // Seguir redirecionamentos
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = res.headers.location.startsWith('http') 
              ? res.headers.location 
              : `${urlObj.protocol}//${urlObj.hostname}${res.headers.location}`;
            console.log(`   ↪ Redirecionando para: ${redirectUrl}`);
            makeRequest(redirectUrl, redirectCount + 1);
            return;
          }

          if (res.statusCode !== 200) {
            console.error(`❌ Erro HTTP ${res.statusCode} ao buscar de ${hotel}`);
            resolve([]);
            return;
          }

          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            const handitems = [];
            
            // Regex para extrair handitems: handitem123=Nome do Item
            const handitemRegex = /handitem(\d+)=(.+)/g;
            let match;

            while ((match = handitemRegex.exec(data)) !== null) {
              const id = parseInt(match[1], 10);
              const name = match[2].trim();
              
              if (!isNaN(id) && name) {
                handitems.push({
                  id,
                  name,
                  hotel
                });
              }
            }

            console.log(`✅ Encontrados ${handitems.length} handitems em ${hotel}`);
            resolve(handitems);
          });
        });

        req.on('error', (error) => {
          console.error(`❌ Erro ao buscar de ${hotel}:`, error.message);
          resolve([]); // Retornar array vazio em caso de erro
        });

        req.setTimeout(30000, () => {
          req.destroy();
          console.error(`❌ Timeout ao buscar de ${hotel}`);
          resolve([]); // Retornar array vazio em caso de timeout
        });
      };

      makeRequest(url.toString());
    } catch (error) {
      console.error(`❌ Erro ao buscar de ${hotel}:`, error.message);
      resolve([]); // Retornar array vazio em caso de erro
    }
  });
}

/**
 * Busca handitems de todos os hotéis e mescla as traduções
 */
async function syncAllHotels() {
  console.log('🔄 Iniciando sincronização de handitems...\n');
  
  const [comItems, brItems, esItems] = await Promise.all([
    fetchExternalFlashTexts('com'),
    fetchExternalFlashTexts('com.br'),
    fetchExternalFlashTexts('es')
  ]);

  console.log(`\n📊 Resumo:`);
  console.log(`   - .com: ${comItems.length} handitems`);
  console.log(`   - .com.br: ${brItems.length} handitems`);
  console.log(`   - .es: ${esItems.length} handitems`);

  // Criar mapa de handitems por ID
  const handitemsMap = new Map();

  // Processar itens do .com (inglês - base)
  comItems.forEach(item => {
    if (!handitemsMap.has(item.id)) {
      handitemsMap.set(item.id, {
        id: item.id,
        name: item.name,
        names: {
          en: item.name,
          pt: item.name, // Fallback
          es: item.name  // Fallback
        }
      });
    } else {
      handitemsMap.get(item.id).names.en = item.name;
    }
  });

  // Processar itens do .com.br (português)
  brItems.forEach(item => {
    if (!handitemsMap.has(item.id)) {
      handitemsMap.set(item.id, {
        id: item.id,
        name: item.name,
        names: {
          en: item.name, // Fallback
          pt: item.name,
          es: item.name  // Fallback
        }
      });
    } else {
      handitemsMap.get(item.id).names.pt = item.name;
    }
  });

  // Processar itens do .es (espanhol)
  esItems.forEach(item => {
    if (!handitemsMap.has(item.id)) {
      handitemsMap.set(item.id, {
        id: item.id,
        name: item.name,
        names: {
          en: item.name, // Fallback
          pt: item.name, // Fallback
          es: item.name
        }
      });
    } else {
      handitemsMap.get(item.id).names.es = item.name;
    }
  });

  // Converter para array e ordenar por ID
  const result = Array.from(handitemsMap.values())
    .sort((a, b) => a.id - b.id);

  console.log(`\n✅ Total de handitems sincronizados: ${result.length}`);
  
  return result;
}

/**
 * Identifica novos handitems comparando com a lista anterior
 */
function identifyNewHanditems(currentHanditems, previousHanditems, maxNew = 5) {
  const previousIds = new Set(previousHanditems.map(h => h.id));
  const newHanditems = currentHanditems
    .filter(h => !previousIds.has(h.id))
    .sort((a, b) => b.id - a.id) // Mais recentes primeiro (IDs maiores)
    .slice(0, maxNew);

  // Marcar como novos
  newHanditems.forEach(item => {
    item.isNew = true;
    item.addedDate = new Date().toISOString();
  });

  if (newHanditems.length > 0) {
    console.log(`\n🆕 Novos handitems encontrados (${newHanditems.length}):`);
    newHanditems.forEach(item => {
      console.log(`   - ID ${item.id}: ${item.names.pt || item.names.en}`);
    });
  }

  return newHanditems;
}

/**
 * Salva handitems no arquivo JSON
 */
function saveHanditems(handitems, outputPath) {
  try {
    // Criar diretório se não existir
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Salvar no formato simples (compatível com o formato atual)
    const simpleFormat = handitems.map(item => ({
      id: item.id,
      name: item.names.pt || item.names.en || item.name
    }));

    fs.writeFileSync(outputPath, JSON.stringify(simpleFormat, null, 2), 'utf-8');
    console.log(`\n💾 Handitems salvos em: ${outputPath}`);
    
    // Salvar também no formato completo (com traduções)
    const fullFormatPath = outputPath.replace('.json', '-full.json');
    fs.writeFileSync(fullFormatPath, JSON.stringify(handitems, null, 2), 'utf-8');
    console.log(`💾 Formato completo salvo em: ${fullFormatPath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar handitems:', error.message);
    return false;
  }
}

/**
 * Carrega handitems anteriores do arquivo
 */
function loadPreviousHanditems(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Converter formato simples para formato completo
    if (Array.isArray(data) && data.length > 0 && !data[0].names) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        names: {
          pt: item.name,
          en: item.name,
          es: item.name
        }
      }));
    }
    
    return data;
  } catch (error) {
    console.warn(`⚠️  Não foi possível carregar handitems anteriores: ${error.message}`);
    return [];
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    const outputPath = path.join(process.cwd(), 'public', 'handitems', 'handitems.json');
    const previousHanditems = loadPreviousHanditems(outputPath);
    
    console.log(`📦 Handitems anteriores: ${previousHanditems.length}\n`);
    
    // Sincronizar de todos os hotéis
    const syncedHanditems = await syncAllHotels();
    
    if (syncedHanditems.length === 0) {
      console.error('❌ Nenhum handitem encontrado. Abortando...');
      process.exit(1);
    }
    
    // Identificar novos handitems
    if (previousHanditems.length > 0) {
      identifyNewHanditems(syncedHanditems, previousHanditems);
    }
    
    // Salvar handitems atualizados
    const saved = saveHanditems(syncedHanditems, outputPath);
    
    if (saved) {
      console.log('\n✅ Sincronização concluída com sucesso!');
      process.exit(0);
    } else {
      console.error('\n❌ Erro ao salvar handitems');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erro na sincronização:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { syncAllHotels, identifyNewHanditems, saveHanditems };
