#!/usr/bin/env node

/**
 * Script para instalar dependências necessárias para o sistema de badges
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Instalando dependências para o sistema de badges...');

// Dependências necessárias
const dependencies = [
  '@supabase/supabase-js',
  'node-fetch'
];

try {
  // Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
  
  console.log('✅ Dependências instaladas com sucesso!');
  
  // Criar diretório de logs
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log('📁 Diretório de logs criado');
  }
  
  // Verificar se arquivo .env existe
  const envFile = path.join(__dirname, '../.env');
  const envExampleFile = path.join(__dirname, '../env.example');
  
  if (!fs.existsSync(envFile) && fs.existsSync(envExampleFile)) {
    fs.copyFileSync(envExampleFile, envFile);
    console.log('⚙️ Arquivo .env criado a partir do exemplo');
    console.log('📝 Configure as variáveis de ambiente no arquivo .env');
  }
  
  console.log('\n🎉 Instalação concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente no arquivo .env');
  console.log('2. Execute a migração: npm run db:migrate');
  console.log('3. Popule o banco: node scripts/populate-badges-database.cjs');
  console.log('4. Configure monitoramento: .\\scripts\\setup-daily-badge-monitoring.ps1');
  
} catch (error) {
  console.error('❌ Erro durante instalação:', error.message);
  process.exit(1);
}
