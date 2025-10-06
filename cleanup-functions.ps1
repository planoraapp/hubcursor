# Script para remover funcoes obsoletas do Supabase
Write-Host "Iniciando limpeza de funcoes obsoletas do Supabase..." -ForegroundColor Yellow

# Lista de funcoes obsoletas para remocao
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

Write-Host "Total de funcoes para remover: $($obsoleteFunctions.Count)" -ForegroundColor Cyan

foreach ($function in $obsoleteFunctions) {
    try {
        Write-Host "Removendo funcao: $function" -ForegroundColor Gray
        $result = npx supabase functions delete $function --no-confirm 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Removida com sucesso: $function" -ForegroundColor Green
            $removedCount++
        } else {
            Write-Host "Erro ao remover: $function" -ForegroundColor Red
            $errorCount++
        }
    } catch {
        Write-Host "Excecao ao remover: $function" -ForegroundColor Red
        $errorCount++
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "RESUMO DA LIMPEZA:" -ForegroundColor Yellow
Write-Host "Funcoes removidas com sucesso: $removedCount" -ForegroundColor Green
Write-Host "Funcoes com erro: $errorCount" -ForegroundColor Red
Write-Host "Total processadas: $($obsoleteFunctions.Count)" -ForegroundColor Cyan

if ($removedCount -gt 0) {
    Write-Host ""
    Write-Host "Limpeza concluida! $removedCount funcoes obsoletas foram removidas." -ForegroundColor Green
}

Write-Host ""
Write-Host "Todas as funcoes estao salvas no backup em backup-supabase-functions/" -ForegroundColor Cyan
