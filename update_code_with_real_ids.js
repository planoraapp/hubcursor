// Script para atualizar o código com os IDs reais
const fs = require('fs');
const path = require('path');

const updateCodeWithRealIds = () => {
  console.log('🚀 ATUALIZANDO CÓDIGO COM IDs REAIS DO HABBO');
  console.log('==============================================');
  
  // IDs reais confirmados pela API do Habbo
  const realIds = {
    habbohub: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
    Beebop: 'hhbr-00e6988dddeb5a1838658c854d62fe49'
  };
  
  console.log('📋 IDs Reais Confirmados:');
  console.log(`habbohub: ${realIds.habbohub}`);
  console.log(`Beebop: ${realIds.Beebop}`);
  
  // Arquivos para atualizar
  const filesToUpdate = [
    'src/hooks/useLatestHomes.tsx',
    'src/pages/Homes.tsx',
    'src/hooks/useHabboHomeV2.tsx',
    'src/components/CollapsibleAppSidebar.tsx'
  ];
  
  filesToUpdate.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`\n📝 Atualizando ${filePath}...`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Substituir IDs fictícios pelos reais
        content = content.replace(/hhbr-habbohub-user-id-12345/g, realIds.habbohub);
        content = content.replace(/hhbr-beebop-user-id-67890/g, realIds.Beebop);
        
        // Substituir referências de nome
        content = content.replace(/habboAccount\.habbo_username/g, 'habboAccount.habbo_name');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filePath} atualizado!`);
      } else {
        console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao atualizar ${filePath}:`, error.message);
    }
  });
  
  // Criar arquivo de configuração com os IDs reais
  const configContent = `// Configuração com IDs reais do Habbo
// ===========================================
// Data: 2025-01-15
// IDs confirmados pela API pública do Habbo

export const REAL_HABBO_IDS = {
  habbohub: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  Beebop: 'hhbr-00e6988dddeb5a1838658c854d62fe49'
};

export const REAL_HABBO_DATA = {
  habbohub: {
    id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
    name: 'habbohub',
    hotel: 'br',
    motto: 'HUB-QQ797',
    figureString: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
    online: false,
    admin: true
  },
  Beebop: {
    id: 'hhbr-00e6988dddeb5a1838658c854d62fe49',
    name: 'Beebop',
    hotel: 'br',
    motto: 'HUB-ACTI1',
    figureString: 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
    online: false,
    admin: false
  }
};

// Função para obter dados reais do usuário
export const getRealHabboData = (username) => {
  const lowerUsername = username.toLowerCase();
  if (lowerUsername === 'habbohub') return REAL_HABBO_DATA.habbohub;
  if (lowerUsername === 'beebop') return REAL_HABBO_DATA.Beebop;
  return null;
};

// Função para verificar se é um usuário real
export const isRealHabboUser = (username) => {
  const lowerUsername = username.toLowerCase();
  return lowerUsername === 'habbohub' || lowerUsername === 'beebop';
};
`;

  try {
    fs.writeFileSync('src/config/realHabboIds.ts', configContent, 'utf8');
    console.log('\n✅ Arquivo de configuração criado: src/config/realHabboIds.ts');
  } catch (error) {
    console.log('\n❌ Erro ao criar arquivo de configuração:', error.message);
  }
  
  console.log('\n🎉 ATUALIZAÇÃO DO CÓDIGO CONCLUÍDA!');
  console.log('===================================');
  console.log('✅ IDs reais aplicados no código');
  console.log('✅ Referências corrigidas');
  console.log('✅ Arquivo de configuração criado');
  console.log('✅ Sistema pronto para uso com dados reais');
};

updateCodeWithRealIds();
