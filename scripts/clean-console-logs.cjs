#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configurações
const SRC_DIR = './src';
const KEEP_ERROR_LOGS = false; // Remover console.error também
const KEEP_WARN_LOGS = false; // Remover console.warn
const DRY_RUN = false; // Se true, apenas mostra o que seria removido

// Estatísticas
let totalFiles = 0;
let totalLogsRemoved = 0;
let filesModified = 0;

// Função para limpar console.logs de um arquivo
function cleanConsoleLogs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Padrões de regex para diferentes tipos de console
    const patterns = [
      // console.log simples
      /console\.log\([^)]*\);?\s*\n/g,
      // console.log com múltiplas linhas (básico)
      /console\.log\([^)]*\);?\s*$/gm,
    ];
    
    // Se não manter console.warn, adicionar padrão
    if (!KEEP_WARN_LOGS) {
      patterns.push(
        /console\.warn\([^)]*\);?\s*\n/g,
        /console\.warn\([^)]*\);?\s*$/gm
      );
    }
    
    // Se não manter console.error, adicionar padrão (normalmente mantemos)
    if (!KEEP_ERROR_LOGS) {
      patterns.push(
        /console\.error\([^)]*\);?\s*\n/g,
        /console\.error\([^)]*\);?\s*$/gm
      );
    }
    
    let cleanedContent = content;
    let logsInFile = 0;
    
    // Aplicar cada padrão
    patterns.forEach(pattern => {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        logsInFile += matches.length;
        cleanedContent = cleanedContent.replace(pattern, '');
      }
    });
    
    // Limpar linhas vazias extras que podem ter sobrado
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (logsInFile > 0) {
      totalLogsRemoved += logsInFile;
      
      if (DRY_RUN) {
        console.log(`📝 ${filePath}: ${logsInFile} logs seriam removidos`);
      } else {
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        console.log(`✅ ${filePath}: ${logsInFile} logs removidos`);
        filesModified++;
      }
    }
    
    totalFiles++;
    
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Função para percorrer diretórios recursivamente
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Pular node_modules e outros diretórios desnecessários
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walkDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      cleanConsoleLogs(filePath);
    }
  });
}

// Função principal
function main() {
  console.log('🧹 Iniciando limpeza de console.logs...');
  console.log(`📁 Diretório: ${SRC_DIR}`);
  console.log(`🔧 Modo: ${DRY_RUN ? 'DRY RUN (apenas visualização)' : 'EXECUÇÃO REAL'}`);
  console.log(`⚠️  Manter console.error: ${KEEP_ERROR_LOGS ? 'SIM' : 'NÃO'}`);
  console.log(`⚠️  Manter console.warn: ${KEEP_WARN_LOGS ? 'SIM' : 'NÃO'}`);
  console.log('─'.repeat(50));
  
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`❌ Diretório ${SRC_DIR} não encontrado!`);
    process.exit(1);
  }
  
  const startTime = Date.now();
  
  walkDirectory(SRC_DIR);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('─'.repeat(50));
  console.log('📊 RELATÓRIO FINAL:');
  console.log(`📁 Arquivos processados: ${totalFiles}`);
  console.log(`🗑️  Total de logs removidos: ${totalLogsRemoved}`);
  console.log(`✏️  Arquivos modificados: ${filesModified}`);
  console.log(`⏱️  Tempo de execução: ${duration}ms`);
  
  if (DRY_RUN) {
    console.log('\n💡 Para executar a limpeza real, altere DRY_RUN para false no script.');
  } else {
    console.log('\n✅ Limpeza concluída com sucesso!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { cleanConsoleLogs, walkDirectory };
