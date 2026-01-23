// Script para testar APIs do Habbo e entender o fluxo correto de busca de dados
import fetch from 'node-fetch';

const USERNAME = 'habbohub';
const HOTEL_DOMAIN = 'com.br';

console.log('🔍 Testando APIs do Habbo para usuário:', USERNAME);
console.log('📍 Hotel:', HOTEL_DOMAIN);
console.log('---\n');

// 1. Buscar usuário por nome
console.log('1️⃣ Buscando usuário por nome...');
try {
  const userByNameUrl = `https://www.habbo.${HOTEL_DOMAIN}/api/public/users?name=${encodeURIComponent(USERNAME)}`;
  console.log('URL:', userByNameUrl);
  const userResponse = await fetch(userByNameUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'HabboHub/1.0'
    }
  });
  
  if (userResponse.ok) {
    const userData = await userResponse.json();
    console.log('✅ Usuário encontrado:');
    console.log(JSON.stringify(userData, null, 2));
    
    const uniqueId = userData.uniqueId;
    console.log('\n📌 UniqueId obtido:', uniqueId);
    
    if (uniqueId) {
      // 2. Buscar perfil completo
      console.log('\n2️⃣ Buscando perfil completo...');
      const profileUrl = `https://www.habbo.${HOTEL_DOMAIN}/api/public/users/${encodeURIComponent(uniqueId)}/profile`;
      console.log('URL:', profileUrl);
      const profileResponse = await fetch(profileUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Perfil completo obtido:');
        console.log('Keys:', Object.keys(profileData));
        console.log('Sample:', JSON.stringify({
          name: profileData.name,
          uniqueId: profileData.uniqueId,
          hasFriends: !!profileData.friends,
          friendsCount: profileData.friends?.length || 0,
          hasGroups: !!profileData.groups,
          groupsCount: profileData.groups?.length || 0,
          hasRooms: !!profileData.rooms,
          roomsCount: profileData.rooms?.length || 0,
          hasBadges: !!profileData.badges,
          badgesCount: profileData.badges?.length || 0
        }, null, 2));
      } else {
        console.log('❌ Erro ao buscar perfil:', profileResponse.status, profileResponse.statusText);
      }
      
      // 3. Buscar dados individuais
      console.log('\n3️⃣ Buscando dados individuais...');
      const endpoints = [
        { name: 'badges', url: `https://www.habbo.${HOTEL_DOMAIN}/api/public/users/${encodeURIComponent(uniqueId)}/badges` },
        { name: 'friends', url: `https://www.habbo.${HOTEL_DOMAIN}/api/public/users/${encodeURIComponent(uniqueId)}/friends` },
        { name: 'groups', url: `https://www.habbo.${HOTEL_DOMAIN}/api/public/users/${encodeURIComponent(uniqueId)}/groups` },
        { name: 'rooms', url: `https://www.habbo.${HOTEL_DOMAIN}/api/public/users/${encodeURIComponent(uniqueId)}/rooms` }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'HabboHub/1.0'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${endpoint.name}:`, Array.isArray(data) ? `${data.length} itens` : 'dados obtidos');
            if (Array.isArray(data) && data.length > 0) {
              console.log(`   Primeiro item:`, JSON.stringify(data[0], null, 2));
            }
          } else {
            console.log(`❌ ${endpoint.name}:`, response.status, response.statusText);
          }
        } catch (error) {
          console.log(`❌ ${endpoint.name}:`, error.message);
        }
      }
      
      // 4. Testar busca por uniqueId diretamente
      console.log('\n4️⃣ Testando busca por uniqueId diretamente...');
      const userByIdUrl = `https://www.habbo.${HOTEL_DOMAIN}/api/public/users/${encodeURIComponent(uniqueId)}`;
      console.log('URL:', userByIdUrl);
      const userByIdResponse = await fetch(userByIdUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });
      
      if (userByIdResponse.ok) {
        const userByIdData = await userByIdResponse.json();
        console.log('✅ Usuário encontrado por uniqueId:');
        console.log(JSON.stringify({
          name: userByIdData.name,
          uniqueId: userByIdData.uniqueId,
          figureString: userByIdData.figureString,
          motto: userByIdData.motto,
          online: userByIdData.online
        }, null, 2));
      } else {
        console.log('❌ Erro ao buscar por uniqueId:', userByIdResponse.status, userByIdResponse.statusText);
      }
      
    } else {
      console.log('❌ UniqueId não encontrado na resposta');
    }
  } else {
    console.log('❌ Erro ao buscar usuário:', userResponse.status, userResponse.statusText);
    const errorText = await userResponse.text();
    console.log('Resposta:', errorText);
  }
} catch (error) {
  console.error('❌ Erro:', error.message);
  console.error(error.stack);
}
