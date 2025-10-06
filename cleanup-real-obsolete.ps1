# Script para remover apenas funcoes realmente obsoletas
Write-Host "Iniciando limpeza de funcoes realmente obsoletas..." -ForegroundColor Yellow

# Lista de funcoes que realmente nao sao utilizadas no codigo
$reallyObsoleteFunctions = @(
    "swift-responder",
    "get-habbo-figures", 
    "create-beebop-test-account",
    "test-habbo-photos",
    "templarios-figuredata",
    "templarios-scraper",
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
    "get-habbo-profile",
    "habbo-activity-detector",
    "habbo-daily-activities-tracker",
    "smart-worker",
    "dynamic-responder",
    "setup-beebop-admin",
    "profilehabbo",
    "smooth-processor",
    "rename-bucket-files",
    "editor-puhekupla",
    "sync-habbo-friend-photos",
    "batch-friends-sync",
    "add-user-to-sync-queue",
    "friends-sync-scheduler",
    "friends-photos-sync"
)

$removedCount = 0
$errorCount = 0

Write-Host "Total de funcoes realmente obsoletas para remover: $($reallyObsoleteFunctions.Count)" -ForegroundColor Cyan

foreach ($function in $reallyObsoleteFunctions) {
    try {
        Write-Host "Removendo funcao: $function" -ForegroundColor Gray
        $result = npx supabase functions delete $function 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Removida com sucesso: $function" -ForegroundColor Green
            $removedCount++
        } else {
            Write-Host "Erro ao remover: $function - $result" -ForegroundColor Red
            $errorCount++
        }
    } catch {
        Write-Host "Excecao ao remover: $function - $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    
    Start-Sleep -Milliseconds 1000
}

Write-Host ""
Write-Host "RESUMO DA LIMPEZA:" -ForegroundColor Yellow
Write-Host "Funcoes removidas com sucesso: $removedCount" -ForegroundColor Green
Write-Host "Funcoes com erro: $errorCount" -ForegroundColor Red
Write-Host "Total processadas: $($reallyObsoleteFunctions.Count)" -ForegroundColor Cyan

if ($removedCount -gt 0) {
    Write-Host ""
    Write-Host "Limpeza concluida! $removedCount funcoes obsoletas foram removidas." -ForegroundColor Green
    Write-Host "Isso deve resultar em reducao significativa de custos!" -ForegroundColor Green
}
