// 🎭 Script para Simular Usuário Logado no HubCursor
// Execute este script no console do navegador para simular um usuário logado

// ===== CONFIGURAÇÕES =====
const USUARIO_SIMULADO = {
  id: "simulacao-123",
  habbo_username: "TesteUsuario",
  habbo_motto: "Testando o HubCursor!",
  habbo_avatar: "https://www.habbo.com.br/habbo-imaging/avatarimage?user=TesteUsuario&size=s&direction=2&head_direction=3&headonly=1",
  created_at: new Date().toISOString()
};

// ===== FUNÇÕES DE SIMULAÇÃO =====

// 1. Simular Login
function simularLogin() {
  console.log("🔐 Simulando login do usuário:", USUARIO_SIMULADO.habbo_username);
  
  // Salvar no localStorage (como o sistema real faz)
  localStorage.setItem('habboUser', JSON.stringify(USUARIO_SIMULADO));
  
  // Disparar evento customizado para notificar mudanças
  window.dispatchEvent(new CustomEvent('habboUserLogin', { 
    detail: USUARIO_SIMULADO 
  }));
  
  console.log("✅ Usuário simulado logado com sucesso!");
  console.log("🔄 Recarregue a página para ver as mudanças na interface");
  
  return USUARIO_SIMULADO;
}

// 2. Simular Logout
function simularLogout() {
  console.log("🚪 Simulando logout do usuário");
  
  // Remover do localStorage
  localStorage.removeItem('habboUser');
  
  // Disparar evento customizado
  window.dispatchEvent(new CustomEvent('habboUserLogout'));
  
  console.log("✅ Usuário simulado desconectado!");
  console.log("🔄 Recarregue a página para ver as mudanças na interface");
}

// 3. Verificar Status Atual
function verificarStatus() {
  const usuario = localStorage.getItem('habboUser');
  if (usuario) {
    const userData = JSON.parse(usuario);
    console.log("👤 Usuário atualmente logado:", userData);
    return userData;
  } else {
    console.log("❌ Nenhum usuário logado");
    return null;
  }
}

// 4. Simular Diferentes Tipos de Usuário
function simularUsuarioAdmin() {
  const adminUser = {
    ...USUARIO_SIMULADO,
    habbo_username: "AdminTeste",
    is_admin: true
  };
  
  localStorage.setItem('habboUser', JSON.stringify(adminUser));
  console.log("👑 Usuário admin simulado logado:", adminUser.habbo_username);
  return adminUser;
}

function simularUsuarioNormal() {
  const normalUser = {
    ...USUARIO_SIMULADO,
    habbo_username: "UsuarioNormal",
    is_admin: false
  };
  
  localStorage.setItem('habboUser', JSON.stringify(normalUser));
  console.log("👤 Usuário normal simulado logado:", normalUser.habbo_username);
  return normalUser;
}

// 5. Testar Funcionalidades Específicas
function testarFuncionalidades() {
  const usuario = verificarStatus();
  if (!usuario) {
    console.log("❌ Faça login primeiro usando simularLogin()");
    return;
  }
  
  console.log("🧪 Testando funcionalidades para usuário logado:");
  console.log("1. Sidebar deve mostrar avatar e nome do usuário");
  console.log("2. Botão de logout deve estar visível");
  console.log("3. Algumas páginas podem ter conteúdo adicional");
  console.log("4. Console pode ter funcionalidades extras");
}

// ===== INSTRUÇÕES DE USO =====
console.log(`
🎭 SIMULADOR DE USUÁRIO LOGADO - HubCursor

📋 FUNÇÕES DISPONÍVEIS:
• simularLogin() - Simula login de usuário normal
• simularUsuarioAdmin() - Simula login de usuário admin
• simularUsuarioNormal() - Simula login de usuário normal
• simularLogout() - Simula logout
• verificarStatus() - Verifica status atual
• testarFuncionalidades() - Testa funcionalidades disponíveis

🚀 COMO USAR:
1. Execute: simularLogin()
2. Recarregue a página (F5)
3. Observe as mudanças na interface
4. Use simularLogout() para voltar ao estado normal

💡 DICA: Execute testarFuncionalidades() após fazer login para ver o que mudou!
`);

// ===== EXPORTAÇÃO DAS FUNÇÕES =====
window.simularUsuarioLogado = {
  simularLogin,
  simularLogout,
  verificarStatus,
  simularUsuarioAdmin,
  simularUsuarioNormal,
  testarFuncionalidades,
  USUARIO_SIMULADO
};

console.log("🎉 Simulador carregado! Use window.simularUsuarioLogado para acessar as funções.");
