// Script de teste para a API HabboFurni
const API_TOKEN = '140|Vfir9f5bgqsLkCMDrgXz6rC6lssEpHNVEu45kkK006bdd0de';
const BASE_URL = 'https://habbofurni.com/api/v1';
const HOTEL_ID = 2; // Habbo Brasil

async function testHabboFurniAPI() {
  console.log('🧪 Testando API HabboFurni...');
  
  try {
    // Teste 1: Buscar mobis de comida
    console.log('\n1️⃣ Testando busca de mobis de comida...');
    const foodResponse = await fetch(`${BASE_URL}/furniture?category=food&per_page=5&page=1`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'X-Hotel-ID': HOTEL_ID.toString(),
        'Accept': 'application/json'
      }
    });
    
    if (foodResponse.ok) {
      const foodData = await foodResponse.json();
      console.log(`✅ Encontrados ${foodData.data?.length || 0} mobis de comida`);
      if (foodData.data?.length > 0) {
        console.log('📦 Primeiro mobi:', foodData.data[0].name, '-', foodData.data[0].classname);
      }
    } else {
      console.log(`❌ Erro na busca de comida: ${foodResponse.status} ${foodResponse.statusText}`);
    }

    // Teste 2: Buscar mobis de bebida
    console.log('\n2️⃣ Testando busca de mobis de bebida...');
    const drinkResponse = await fetch(`${BASE_URL}/furniture?category=drink&per_page=5&page=1`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'X-Hotel-ID': HOTEL_ID.toString(),
        'Accept': 'application/json'
      }
    });
    
    if (drinkResponse.ok) {
      const drinkData = await drinkResponse.json();
      console.log(`✅ Encontrados ${drinkData.data?.length || 0} mobis de bebida`);
      if (drinkData.data?.length > 0) {
        console.log('🥤 Primeiro mobi:', drinkData.data[0].name, '-', drinkData.data[0].classname);
      }
    } else {
      console.log(`❌ Erro na busca de bebida: ${drinkResponse.status} ${drinkResponse.statusText}`);
    }

    // Teste 3: Buscar um mobi específico conhecido
    console.log('\n3️⃣ Testando busca de mobi específico (bar_polyfon)...');
    const specificResponse = await fetch(`${BASE_URL}/furniture/bar_polyfon`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'X-Hotel-ID': HOTEL_ID.toString(),
        'Accept': 'application/json'
      }
    });
    
    if (specificResponse.ok) {
      const specificData = await specificResponse.json();
      console.log(`✅ Mobi encontrado: ${specificData.data?.name || 'N/A'}`);
      console.log(`📝 Descrição: ${specificData.data?.description || 'N/A'}`);
      console.log(`🏷️ Categoria: ${specificData.data?.category || 'N/A'}`);
    } else {
      console.log(`❌ Erro na busca específica: ${specificResponse.status} ${specificResponse.statusText}`);
    }

    // Teste 4: Buscar mobis que podem dar handitems
    console.log('\n4️⃣ Testando busca de mobis que podem dar handitems...');
    const handitemCategories = ['trophy', 'prize', 'gift'];
    let totalHanditemMobis = 0;
    
    for (const category of handitemCategories) {
      const response = await fetch(`${BASE_URL}/furniture?category=${category}&per_page=10&page=1`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'X-Hotel-ID': HOTEL_ID.toString(),
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const count = data.data?.length || 0;
        totalHanditemMobis += count;
        console.log(`📦 ${category}: ${count} mobis`);
      } else {
        console.log(`❌ Erro na categoria ${category}: ${response.status}`);
      }
    }
    
    console.log(`\n🎯 Total de mobis que podem dar handitems: ${totalHanditemMobis}`);

  } catch (error) {
    console.error('❌ Erro geral na API:', error.message);
  }
}

// Executar o teste
testHabboFurniAPI();
