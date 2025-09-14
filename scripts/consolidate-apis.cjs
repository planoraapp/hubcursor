#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configurações
const SERVICES_DIR = './src/services';
const UNIFIED_SERVICE_PATH = './src/services/unifiedHabboService.ts';
const DRY_RUN = false;

// APIs redundantes que devem ser migradas
const REDUNDANT_APIS = [
  'habboProxyService.ts',
  'habboApiMultiHotel.ts', 
  'habboOfficialService.ts',
  'HabboAPIService.ts',
  'habboApi.ts'
];

// Estatísticas
let totalMethods = 0;
let totalImports = 0;
let filesProcessed = 0;

// Função para extrair métodos únicos de um serviço
function extractMethods(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const methods = [];
    
    // Regex para encontrar métodos/funções
    const methodRegex = /(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(|(\w+):\s*(?:async\s+)?\s*\([^)]*\)\s*=>)/g;
    
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
      const methodName = match[1] || match[2] || match[3];
      if (methodName && !methodName.startsWith('_')) {
        methods.push(methodName);
      }
    }
    
    return methods;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return [];
  }
}

// Função para atualizar imports em um arquivo
function updateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let importsUpdated = 0;
    
    // Padrões de import para cada API redundante
    const importPatterns = [
      {
        api: 'habboProxyService',
        patterns: [
          /import\s*{\s*habboProxyService\s*}\s*from\s*['"][^'"]*habboProxyService['"];?\s*\n/g,
          /import\s*{\s*habboProxyService\s*}\s*from\s*['"][^'"]*services\/habboProxyService['"];?\s*\n/g
        ],
        replacement: "import { unifiedHabboService } from '@/services/unifiedHabboService';\n"
      },
      {
        api: 'habboApiMultiHotel',
        patterns: [
          /import\s*{\s*habboApiMultiHotel\s*}\s*from\s*['"][^'"]*habboApiMultiHotel['"];?\s*\n/g,
          /import\s*{\s*habboApiMultiHotel\s*}\s*from\s*['"][^'"]*services\/habboApiMultiHotel['"];?\s*\n/g
        ],
        replacement: "import { unifiedHabboService } from '@/services/unifiedHabboService';\n"
      },
      {
        api: 'habboOfficialService',
        patterns: [
          /import\s*{\s*habboOfficialService\s*}\s*from\s*['"][^'"]*habboOfficialService['"];?\s*\n/g,
          /import\s*{\s*habboOfficialService\s*}\s*from\s*['"][^'"]*services\/habboOfficialService['"];?\s*\n/g
        ],
        replacement: "import { unifiedHabboService } from '@/services/unifiedHabboService';\n"
      },
      {
        api: 'HabboAPIService',
        patterns: [
          /import\s*{\s*HabboAPIService\s*}\s*from\s*['"][^'"]*HabboAPIService['"];?\s*\n/g,
          /import\s*{\s*HabboAPIService\s*}\s*from\s*['"][^'"]*services\/HabboAPIService['"];?\s*\n/g
        ],
        replacement: "import { unifiedHabboService } from '@/services/unifiedHabboService';\n"
      },
      {
        api: 'habboApi',
        patterns: [
          /import\s*{\s*habboApi\s*}\s*from\s*['"][^'"]*habboApi['"];?\s*\n/g,
          /import\s*{\s*habboApi\s*}\s*from\s*['"][^'"]*services\/habboApi['"];?\s*\n/g
        ],
        replacement: "import { unifiedHabboService } from '@/services/unifiedHabboService';\n"
      }
    ];
    
    // Aplicar cada padrão de substituição
    importPatterns.forEach(({ api, patterns, replacement }) => {
      patterns.forEach(pattern => {
        if (pattern.test(updatedContent)) {
          updatedContent = updatedContent.replace(pattern, replacement);
          importsUpdated++;
        }
      });
    });
    
    // Substituir chamadas de métodos
    const methodCallPatterns = [
      { from: 'habboProxyService.', to: 'unifiedHabboService.' },
      { from: 'habboApiMultiHotel.', to: 'unifiedHabboService.' },
      { from: 'habboOfficialService.', to: 'unifiedHabboService.' },
      { from: 'HabboAPIService.', to: 'unifiedHabboService.' },
      { from: 'habboApi.', to: 'unifiedHabboService.' }
    ];
    
    methodCallPatterns.forEach(({ from, to }) => {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, to);
        importsUpdated++;
      }
    });
    
    if (importsUpdated > 0) {
      if (DRY_RUN) {
        console.log(`📝 ${filePath}: ${importsUpdated} imports seriam atualizados`);
      } else {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ ${filePath}: ${importsUpdated} imports atualizados`);
      }
      totalImports += importsUpdated;
    }
    
    return importsUpdated > 0;
  } catch (error) {
    console.error(`❌ Erro ao atualizar imports em ${filePath}:`, error.message);
    return false;
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
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const wasUpdated = updateImports(filePath);
      if (wasUpdated) {
        filesProcessed++;
      }
    }
  });
}

// Função para analisar métodos das APIs redundantes
function analyzeRedundantAPIs() {
  console.log('🔍 Analisando métodos das APIs redundantes...');
  
  REDUNDANT_APIS.forEach(apiFile => {
    const filePath = path.join(SERVICES_DIR, apiFile);
    if (fs.existsSync(filePath)) {
      const methods = extractMethods(filePath);
      console.log(`📊 ${apiFile}: ${methods.length} métodos encontrados`);
      methods.forEach(method => {
        console.log(`  - ${method}`);
        totalMethods++;
      });
    } else {
      console.log(`⚠️  ${apiFile}: arquivo não encontrado`);
    }
  });
}

// Função principal
function main() {
  console.log('🔧 Iniciando consolidação de APIs...');
  console.log(`📁 Diretório de serviços: ${SERVICES_DIR}`);
  console.log(`🎯 Serviço unificado: ${UNIFIED_SERVICE_PATH}`);
  console.log(`🔧 Modo: ${DRY_RUN ? 'DRY RUN (apenas visualização)' : 'EXECUÇÃO REAL'}`);
  console.log('─'.repeat(60));
  
  if (!fs.existsSync(SERVICES_DIR)) {
    console.error(`❌ Diretório ${SERVICES_DIR} não encontrado!`);
    process.exit(1);
  }
  
  if (!fs.existsSync(UNIFIED_SERVICE_PATH)) {
    console.error(`❌ Serviço unificado ${UNIFIED_SERVICE_PATH} não encontrado!`);
    process.exit(1);
  }
  
  const startTime = Date.now();
  
  // Analisar APIs redundantes
  analyzeRedundantAPIs();
  
  console.log('\n🔄 Atualizando imports em todos os arquivos...');
  
  // Atualizar imports em todos os arquivos
  walkDirectory('./src');
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('─'.repeat(60));
  console.log('📊 RELATÓRIO FINAL:');
  console.log(`🔍 Métodos analisados: ${totalMethods}`);
  console.log(`🔄 Imports atualizados: ${totalImports}`);
  console.log(`📁 Arquivos processados: ${filesProcessed}`);
  console.log(`⏱️  Tempo de execução: ${duration}ms`);
  
  if (DRY_RUN) {
    console.log('\n💡 Para executar a consolidação real, altere DRY_RUN para false no script.');
  } else {
    console.log('\n✅ Consolidação de APIs concluída!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Verificar se unifiedHabboService.ts tem todos os métodos necessários');
    console.log('2. Testar funcionalidades após a migração');
    console.log('3. Remover APIs redundantes após confirmação');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { extractMethods, updateImports, walkDirectory };
