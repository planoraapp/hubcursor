#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configurações
const SRC_DIR = './src';
const TYPES_DIR = './src/types';
const DRY_RUN = false;

// Interfaces conhecidas que devem ser centralizadas
const KNOWN_INTERFACES = [
  'Widget', 'Sticker', 'Background', 'GuestbookEntry', 'HabboData',
  'HabboUser', 'UserProfile', 'Badge', 'Photo', 'Room', 'Group',
  'Friend', 'Activity', 'Feed', 'MarketplaceItem', 'ClothingItem',
  'FigureData', 'Avatar', 'Profile', 'ConsoleData', 'HotelConfig'
];

// Estatísticas
let totalInterfaces = 0;
let totalDuplicates = 0;
let filesProcessed = 0;

// Função para extrair interfaces de um arquivo
function extractInterfaces(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const interfaces = [];
    
    // Regex para encontrar interfaces TypeScript
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+\w+)?\s*{([^}]*)}/gs;
    
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceName = match[1];
      const interfaceBody = match[2];
      
      if (KNOWN_INTERFACES.includes(interfaceName)) {
        interfaces.push({
          name: interfaceName,
          body: interfaceBody,
          fullMatch: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    }
    
    return interfaces;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return [];
  }
}

// Função para centralizar interfaces em um arquivo
function centralizeInterfaces(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const interfaces = extractInterfaces(filePath);
    
    if (interfaces.length === 0) {
      return 0;
    }
    
    let updatedContent = content;
    let interfacesRemoved = 0;
    
    // Remover interfaces duplicadas (em ordem reversa para manter índices)
    interfaces.reverse().forEach(interfaceInfo => {
      // Verificar se já existe no arquivo de tipos centralizados
      const typesFilePath = path.join(TYPES_DIR, 'habbo.ts');
      if (fs.existsSync(typesFilePath)) {
        const typesContent = fs.readFileSync(typesFilePath, 'utf8');
        if (typesContent.includes(`interface ${interfaceInfo.name}`)) {
          // Interface já existe centralizada, remover do arquivo atual
          updatedContent = updatedContent.slice(0, interfaceInfo.startIndex) + 
                          updatedContent.slice(interfaceInfo.endIndex);
          interfacesRemoved++;
        }
      }
    });
    
    // Adicionar import se necessário
    if (interfacesRemoved > 0) {
      const importLine = "import type { " + interfaces.map(i => i.name).join(', ') + " } from '@/types/habbo';\n";
      
      // Verificar se o import já existe
      if (!updatedContent.includes("from '@/types/habbo'")) {
        // Adicionar import após outros imports
        const importRegex = /(import\s+[^;]+;?\s*\n)+/;
        const importMatch = updatedContent.match(importRegex);
        
        if (importMatch) {
          updatedContent = updatedContent.replace(importMatch[0], importMatch[0] + importLine);
        } else {
          // Adicionar no início do arquivo
          updatedContent = importLine + updatedContent;
        }
      }
    }
    
    if (interfacesRemoved > 0) {
      if (DRY_RUN) {
        console.log(`📝 ${filePath}: ${interfacesRemoved} interfaces seriam centralizadas`);
      } else {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ ${filePath}: ${interfacesRemoved} interfaces centralizadas`);
      }
      totalDuplicates += interfacesRemoved;
    }
    
    totalInterfaces += interfaces.length;
    return interfacesRemoved > 0;
  } catch (error) {
    console.error(`❌ Erro ao centralizar interfaces em ${filePath}:`, error.message);
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
      if (!['node_modules', '.git', 'dist', 'build', 'types'].includes(file)) {
        walkDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const wasUpdated = centralizeInterfaces(filePath);
      if (wasUpdated) {
        filesProcessed++;
      }
    }
  });
}

// Função para criar arquivo de tipos centralizados se não existir
function ensureTypesDirectory() {
  if (!fs.existsSync(TYPES_DIR)) {
    fs.mkdirSync(TYPES_DIR, { recursive: true });
    console.log(`📁 Diretório de tipos criado: ${TYPES_DIR}`);
  }
  
  const habboTypesPath = path.join(TYPES_DIR, 'habbo.ts');
  if (!fs.existsSync(habboTypesPath)) {
    const defaultContent = `// Interfaces centralizadas para dados do Habbo
// Este arquivo contém todas as interfaces principais do projeto

export interface Widget {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
  config?: any;
}

export interface Sticker {
  id: string;
  sticker_id: string;
  x: number;
  y: number;
  z_index: number;
  scale: number;
  rotation: number;
  sticker_src: string;
  category: string;
}

export interface Background {
  background_type: 'color' | 'cover' | 'repeat' | 'image';
  background_value: string;
}

export interface GuestbookEntry {
  id: string;
  home_owner_user_id?: string;
  author_habbo_name: string;
  author_look?: string;
  author_hotel?: string;
  message: string;
  moderation_status?: string;
  created_at: string;
  updated_at?: string;
}

export interface HabboData {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  motto: string;
  figure_string: string;
  is_online: boolean;
  memberSince?: string;
}

export interface HabboUser {
  id: string;
  name: string;
  motto: string;
  online: boolean;
  memberSince: string;
  selectedBadges?: any[];
  badges?: any[];
  figureString: string;
  profileVisible?: boolean;
  uniqueId?: string;
}

export interface HomeCanvasProps {
  widgets: Widget[];
  stickers: Sticker[];
  background: Background;
  habboData: HabboData | null;
  isEditMode: boolean;
  isOwner: boolean;
  onWidgetMove: (widgetId: string, x: number, y: number) => void;
  onStickerMove: (stickerId: string, x: number, y: number) => void;
  onAddSticker: (stickerId: string, x: number, y: number, stickerSrc: string, category: string) => Promise<boolean>;
  onRemoveSticker: (stickerId: string) => void;
  onBackgroundChange: (bgType: 'color' | 'cover' | 'repeat' | 'image', bgValue: string) => void;
  currentUser?: { id: string; habbo_name: string };
}

export interface HomeWidgetProps {
  widget: Widget;
  habboData: HabboData | null;
  isEditMode: boolean;
  isOwner: boolean;
  onMove: (x: number, y: number) => void;
  onRemove: () => void;
  currentUser?: { id: string; habbo_name: string };
}
`;
    
    fs.writeFileSync(habboTypesPath, defaultContent, 'utf8');
    console.log(`📄 Arquivo de tipos padrão criado: ${habboTypesPath}`);
  }
}

// Função principal
function main() {
  console.log('🔧 Iniciando centralização de interfaces...');
  console.log(`📁 Diretório fonte: ${SRC_DIR}`);
  console.log(`📁 Diretório de tipos: ${TYPES_DIR}`);
  console.log(`🔧 Modo: ${DRY_RUN ? 'DRY RUN (apenas visualização)' : 'EXECUÇÃO REAL'}`);
  console.log('─'.repeat(60));
  
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`❌ Diretório ${SRC_DIR} não encontrado!`);
    process.exit(1);
  }
  
  // Garantir que o diretório de tipos existe
  ensureTypesDirectory();
  
  const startTime = Date.now();
  
  // Processar todos os arquivos
  walkDirectory(SRC_DIR);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('─'.repeat(60));
  console.log('📊 RELATÓRIO FINAL:');
  console.log(`🔍 Interfaces encontradas: ${totalInterfaces}`);
  console.log(`🔄 Interfaces centralizadas: ${totalDuplicates}`);
  console.log(`📁 Arquivos processados: ${filesProcessed}`);
  console.log(`⏱️  Tempo de execução: ${duration}ms`);
  
  if (DRY_RUN) {
    console.log('\n💡 Para executar a centralização real, altere DRY_RUN para false no script.');
  } else {
    console.log('\n✅ Centralização de interfaces concluída!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Verificar se todas as interfaces estão no arquivo centralizado');
    console.log('2. Testar compilação TypeScript');
    console.log('3. Verificar se não há erros de import');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { extractInterfaces, centralizeInterfaces, walkDirectory };
