// Configuração com IDs reais do Habbo
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
