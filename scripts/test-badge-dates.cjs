const https = require('https');

console.log('🔍 Verificando informações de data nos badges...\n');

// Função para fazer requisição HTTPS
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Erro ao parsear JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

const main = async () => {
  try {
    // Buscar badges mais recentes
    console.log('📅 Buscando badges mais recentes...');
    const recentBadges = await makeRequest('https://www.habboassets.com/api/v1/badges?limit=10&order=desc');
    
    console.log(`\n✅ Encontrados ${recentBadges.badges.length} badges recentes:\n`);
    
    recentBadges.badges.slice(0, 5).forEach((badge, i) => {
      const createdDate = new Date(badge.created_at);
      const formattedDate = createdDate.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log(`${i + 1}. ${badge.code}`);
      console.log(`   Nome: ${badge.name || 'N/A'}`);
      console.log(`   Hotel: ${badge.hotel}`);
      console.log(`   Criado: ${formattedDate}`);
      console.log(`   Raw: ${badge.created_at}`);
      console.log('');
    });
    
    // Buscar badges mais antigos
    console.log('📅 Buscando badges mais antigos...');
    const oldBadges = await makeRequest('https://www.habboassets.com/api/v1/badges?limit=10&order=asc');
    
    console.log(`\n✅ Encontrados ${oldBadges.badges.length} badges antigos:\n`);
    
    oldBadges.badges.slice(0, 3).forEach((badge, i) => {
      const createdDate = new Date(badge.created_at);
      const formattedDate = createdDate.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log(`${i + 1}. ${badge.code}`);
      console.log(`   Nome: ${badge.name || 'N/A'}`);
      console.log(`   Hotel: ${badge.hotel}`);
      console.log(`   Criado: ${formattedDate}`);
      console.log(`   Raw: ${badge.created_at}`);
      console.log('');
    });
    
    // Verificar se há diferença entre created_at e updated_at
    console.log('🔄 Verificando diferenças entre created_at e updated_at...');
    const sampleBadge = recentBadges.badges[0];
    console.log(`Badge: ${sampleBadge.code}`);
    console.log(`Created: ${sampleBadge.created_at}`);
    console.log(`Updated: ${sampleBadge.updated_at}`);
    console.log(`São iguais: ${sampleBadge.created_at === sampleBadge.updated_at}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

main();
