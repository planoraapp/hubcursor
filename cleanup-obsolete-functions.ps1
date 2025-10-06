# Script para remover funções obsoletas do Supabase
# Execute este script no diretório supabase

Write-Host "🗑️ Iniciando limpeza de funções obsoletas do Supabase..." -ForegroundColor Yellow

# Lista de funções obsoletas para remoção
$obsoleteFunctions = @(
    "swift-responder",
    "get-habbo-figures", 
    "create-beebop-test-account",
    "setup-beebop-admin",
    "test-habbo-photos",
    "templarios-figuredata",
    "templarios-scraper",
    "habbo-api-proxy",
    "habbo-login",
    "apply-migration",
    "habbo-change-detector",
    "habbo-change-scheduler",
    "habbo-batch-friends-processor",
    "habbo-user-search",
    "habbo-market-history",
    "habbo-photo-discovery",
    "habbo-discover-by-badges",
    "verify-and-register-via-motto",
    "verify-motto-and-create-account",
    "register-or-reset-via-motto",
    "get-official-habbo-clothing",
    "get-real-habbo-data",
    "get-unified-clothing-data",
    "get-unified-habbo-clothing",
    "unified-clothing-api",
    "get-auth-email-for-habbo",
    "habbo-proxy",
    "habbo-friends-activities",
    "habbo-connect",
    "sync-friend-activities",
    "get-habbo-profile"
)

$removedCount = 0
$errorCount = 0

Write-Host "📊 Total de funções para remover: $($obsoleteFunctions.Count)" -ForegroundColor Cyan

foreach ($function in $obsoleteFunctions) {
    try {
        Write-Host "🗑️ Removendo função: $function" -ForegroundColor Gray
        $result = npx supabase functions delete $function --no-confirm 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Removida com sucesso: $function" -ForegroundColor Green
            $removedCount++
        } else {
            Write-Host "❌ Erro ao remover: $function" -ForegroundColor Red
            Write-Host "   Detalhes: $result" -ForegroundColor Red
            $errorCount++
        }
    } catch {
        Write-Host "❌ Exceção ao remover: $function" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    
    # Pequena pausa entre comandos
    Start-Sleep -Milliseconds 500
}

Write-Host "`n📊 RESUMO DA LIMPEZA:" -ForegroundColor Yellow
Write-Host "✅ Funções removidas com sucesso: $removedCount" -ForegroundColor Green
Write-Host "❌ Funções com erro: $errorCount" -ForegroundColor Red
Write-Host "📈 Total processadas: $($obsoleteFunctions.Count)" -ForegroundColor Cyan

if ($removedCount -gt 0) {
    Write-Host "`n🎉 Limpeza concluída! $removedCount funções obsoletas foram removidas." -ForegroundColor Green
    Write-Host "💰 Isso deve resultar em redução significativa de custos!" -ForegroundColor Green
}

if ($errorCount -gt 0) {
    Write-Host "`n⚠️ Algumas funções não puderam ser removidas. Verifique os erros acima." -ForegroundColor Yellow
}

Write-Host "`n💾 Todas as funções estão salvas no backup em backup-supabase-functions/" -ForegroundColor Cyan
