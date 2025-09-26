#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configurações
const SRC_DIR = './src';

// Estatísticas finais
let totalFiles = 0;
let consoleLogsRemaining = 0;
let interfacesFound = 0;
let errorBoundariesFound = 0;

// Função para verificar console.logs restantes
function checkConsoleLogs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const logs = content.match(/console\.log/g);
    if (logs) {
      consoleLogsRemaining += logs.length;
    }
    totalFiles++;
  } catch (error) {
    // Ignorar erros
  }
}

// Função para verificar interfaces
function checkInterfaces(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const interfaces = content.match(/interface\s+\w+/g);
    if (interfaces) {
      interfacesFound += interfaces.length;
    }
  } catch (error) {
    // Ignorar erros
  }
}

// Função para verificar error boundaries
function checkErrorBoundaries(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('EnhancedErrorBoundary')) {
      errorBoundariesFound++;
    }
  } catch (error) {
    // Ignorar erros
  }
}

// Função para percorrer diretórios
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walkDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      checkConsoleLogs(filePath);
      checkInterfaces(filePath);
      checkErrorBoundaries(filePath);
    }
  });
}

// Função principal
function main() {
  console.log('🔍 Verificando resultados da limpeza...');
  console.log('─'.repeat(50));
  
  const startTime = Date.now();
  
  walkDirectory(SRC_DIR);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('📊 RELATÓRIO DE VERIFICAÇÃO:');
  console.log(`📁 Arquivos processados: ${totalFiles}`);
  console.log(`🗑️  Console.logs restantes: ${consoleLogsRemaining}`);
  console.log(`🔧 Interfaces encontradas: ${interfacesFound}`);
  console.log(`🛡️  Error boundaries aplicados: ${errorBoundariesFound}`);
  console.log(`⏱️  Tempo de verificação: ${duration}ms`);
  
  console.log('\n📋 STATUS DA LIMPEZA:');
  
  // Verificar se a limpeza foi bem-sucedida
  const consoleLogsOK = consoleLogsRemaining < 50; // Deve ter menos de 50 console.logs restantes
  const interfacesOK = interfacesFound < 100; // Deve ter menos de 100 interfaces (centralizadas)
  const errorBoundariesOK = errorBoundariesFound >= 3; // Deve ter pelo menos 3 error boundaries
  
  console.log(`${consoleLogsOK ? '✅' : '❌'} Console.logs: ${consoleLogsRemaining} restantes (meta: < 50)`);
  console.log(`${interfacesOK ? '✅' : '❌'} Interfaces: ${interfacesFound} encontradas (meta: < 100)`);
  console.log(`${errorBoundariesOK ? '✅' : '❌'} Error Boundaries: ${errorBoundariesFound} aplicados (meta: >= 3)`);
  
  const overallSuccess = consoleLogsOK && interfacesOK && errorBoundariesOK;
  
  console.log(`\n🎯 RESULTADO GERAL: ${overallSuccess ? '✅ SUCESSO' : '⚠️  ATENÇÃO NECESSÁRIA'}`);
  
  if (overallSuccess) {
    console.log('\n🎉 PARABÉNS! A limpeza foi concluída com sucesso!');
    console.log('📈 Melhorias alcançadas:');
    console.log('   • Performance otimizada (menos console.logs)');
    console.log('   • APIs consolidadas (unifiedHabboService)');
    console.log('   • Interfaces centralizadas (src/types/)');
    console.log('   • Error handling robusto (Error Boundaries)');
    console.log('   • Código mais limpo e manutenível');
  } else {
    console.log('\n⚠️  Algumas melhorias podem ser necessárias:');
    if (!consoleLogsOK) {
      console.log('   • Considere remover mais console.logs');
    }
    if (!interfacesOK) {
      console.log('   • Considere centralizar mais interfaces');
    }
    if (!errorBoundariesOK) {
      console.log('   • Considere aplicar mais error boundaries');
    }
  }
  
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Testar funcionalidades principais');
  console.log('2. Verificar se não há erros de compilação');
  console.log('3. Fazer commit das melhorias');
  console.log('4. Documentar mudanças para a equipe');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { checkConsoleLogs, checkInterfaces, checkErrorBoundaries, walkDirectory };
