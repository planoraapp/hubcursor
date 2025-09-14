const fs = require('fs');
const path = require('path');

// Diretório das migrações
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

// Função para ler e consolidar todas as migrações
function consolidateMigrations() {
  try {
    console.log('🔄 Consolidando migrações...');
    
    // Ler todos os arquivos .sql
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar por nome (que inclui timestamp)
    
    console.log(`📁 Encontrados ${files.length} arquivos de migração`);
    
    let consolidatedSQL = `-- ========================================
-- MIGRAÇÃO CONSOLIDADA - HABBO HUB
-- ========================================
-- Este arquivo contém todas as migrações consolidadas
-- Data de consolidação: ${new Date().toISOString()}
-- Total de arquivos: ${files.length}
-- ========================================

`;

    // Processar cada arquivo
    files.forEach((file, index) => {
      const filePath = path.join(migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      console.log(`📄 Processando: ${file}`);
      
      // Adicionar cabeçalho do arquivo
      consolidatedSQL += `\n-- ========================================
-- ARQUIVO: ${file}
-- ========================================

`;
      
      // Adicionar conteúdo do arquivo
      consolidatedSQL += content;
      
      // Adicionar separador
      consolidatedSQL += `\n\n-- ========================================
-- FIM DO ARQUIVO: ${file}
-- ========================================

`;
    });
    
    // Salvar arquivo consolidado
    const outputPath = path.join(__dirname, 'supabase_consolidated_migration.sql');
    fs.writeFileSync(outputPath, consolidatedSQL, 'utf8');
    
    console.log(`✅ Migração consolidada salva em: ${outputPath}`);
    console.log(`📊 Tamanho do arquivo: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Criar também um arquivo limpo (sem comentários de separação)
    const cleanSQL = consolidatedSQL
      .replace(/-- ========================================.*?-- ========================================\n\n/gs, '')
      .replace(/-- ARQUIVO: .*?\n-- ========================================\n\n/gs, '')
      .replace(/-- FIM DO ARQUIVO: .*?\n-- ========================================\n\n/gs, '');
    
    const cleanOutputPath = path.join(__dirname, 'supabase_clean_migration.sql');
    fs.writeFileSync(cleanOutputPath, cleanSQL, 'utf8');
    
    console.log(`✅ Migração limpa salva em: ${cleanOutputPath}`);
    console.log(`📊 Tamanho do arquivo limpo: ${(fs.statSync(cleanOutputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Estatísticas
    console.log('\n📈 ESTATÍSTICAS:');
    console.log(`   • Total de arquivos: ${files.length}`);
    console.log(`   • Arquivo consolidado: ${outputPath}`);
    console.log(`   • Arquivo limpo: ${cleanOutputPath}`);
    console.log(`   • Tamanho total: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Erro ao consolidar migrações:', error);
  }
}

// Executar consolidação
consolidateMigrations();
