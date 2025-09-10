# ========================================
# SCRIPT PARA APLICAR MIGRAÇÕES DE CONSOLIDAÇÃO
# ========================================

Write-Host "🚀 [CONSOLIDAÇÃO] Iniciando aplicação das migrações..." -ForegroundColor Green

# 1. Aplicar migração da conta habbohub
Write-Host "📝 [MIGRAÇÃO 1] Criando conta habbohub..." -ForegroundColor Yellow
supabase db push --file supabase/migrations/20250909000001_create_habbohub_account.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ [MIGRAÇÃO 1] Conta habbohub criada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ [MIGRAÇÃO 1] Erro ao criar conta habbohub" -ForegroundColor Red
    exit 1
}

# 2. Aplicar limpeza de tabelas duplicadas
Write-Host "🧹 [MIGRAÇÃO 2] Limpando tabelas duplicadas..." -ForegroundColor Yellow
supabase db push --file supabase/migrations/20250909000002_cleanup_duplicate_tables.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ [MIGRAÇÃO 2] Tabelas duplicadas removidas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ [MIGRAÇÃO 2] Erro ao limpar tabelas duplicadas" -ForegroundColor Red
    exit 1
}

# 3. Aplicar consolidação do sistema de autenticação
Write-Host "🔐 [MIGRAÇÃO 3] Consolidando sistema de autenticação..." -ForegroundColor Yellow
supabase db push --file supabase/migrations/20250909000003_consolidate_auth_system.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ [MIGRAÇÃO 3] Sistema de autenticação consolidado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ [MIGRAÇÃO 3] Erro ao consolidar sistema de autenticação" -ForegroundColor Red
    exit 1
}

# 4. Executar testes do sistema consolidado
Write-Host "🧪 [MIGRAÇÃO 4] Executando testes do sistema..." -ForegroundColor Yellow
supabase db push --file supabase/migrations/20250909000004_test_consolidated_system.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ [MIGRAÇÃO 4] Testes executados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ [MIGRAÇÃO 4] Erro ao executar testes" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 [CONSOLIDAÇÃO] Todas as migrações aplicadas com sucesso!" -ForegroundColor Green
Write-Host "📋 [RESUMO] Sistema consolidado:" -ForegroundColor Cyan
Write-Host "   - Conta habbohub criada (senha: 151092)" -ForegroundColor White
Write-Host "   - Tabelas duplicadas removidas" -ForegroundColor White
Write-Host "   - Sistema de autenticação consolidado" -ForegroundColor White
Write-Host "   - Apenas tabelas essenciais mantidas" -ForegroundColor White
Write-Host "   - Índices otimizados criados" -ForegroundColor White

Write-Host "🔑 [CREDENCIAIS] Para testar:" -ForegroundColor Magenta
Write-Host "   - Beebop / 290684" -ForegroundColor White
Write-Host "   - habbohub / 151092" -ForegroundColor White
