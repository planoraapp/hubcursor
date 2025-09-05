import fetch from 'node-fetch';

console.log('🔍 Testando API do HabboAssets...');

async function testAPI() {
  try {
    const url = 'https://www.habboassets.com/api/v1/badges?hotel=com&limit=10';
    console.log(`📥 Testando URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Tipo de dados: ${typeof data}`);
      console.log(`📊 É array: ${Array.isArray(data)}`);
      console.log(`📊 Chaves: ${Object.keys(data)}`);
      console.log(`📊 Dados completos:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Erro: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAPI();
