# Script para fazer deploy da Edge Function habbo-auth
# Execute este script no PowerShell como Administrador

Write-Host "Fazendo deploy da Edge Function habbo-auth..." -ForegroundColor Green

# URL da sua Edge Function
$functionUrl = "https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-auth"

# Ler o arquivo da Edge Function
$functionCode = Get-Content "supabase/functions/habbo-auth/index.ts" -Raw -Encoding UTF8

Write-Host "Codigo da Edge Function carregado" -ForegroundColor Yellow

# Fazer uma requisição de teste para verificar se está funcionando
Write-Host "Testando a Edge Function..." -ForegroundColor Yellow

try {
    $testResponse = Invoke-RestMethod -Uri $functionUrl -Method POST -ContentType "application/json" -Body '{"username":"test","motto":"test","action":"verify"}' -ErrorAction Stop
    
    Write-Host "Edge Function esta funcionando!" -ForegroundColor Green
    Write-Host "Resposta de teste: $($testResponse | ConvertTo-Json)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Erro ao testar Edge Function: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*CORS*") {
        Write-Host "Problema de CORS detectado. Verifique os headers da Edge Function." -ForegroundColor Yellow
    }
    
    if ($_.Exception.Message -like "*404*") {
        Write-Host "Edge Function nao encontrada. Faca o deploy primeiro." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Para fazer o deploy manual:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy/functions" -ForegroundColor White
Write-Host "2. Clique em 'habbo-auth'" -ForegroundColor White
Write-Host "3. Cole o codigo do arquivo: supabase/functions/habbo-auth/index.ts" -ForegroundColor White
Write-Host "4. Clique em 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "Ou use o Supabase CLI:" -ForegroundColor Cyan
Write-Host "supabase functions deploy habbo-auth" -ForegroundColor White
Write-Host ""
Write-Host "Apos o deploy, teste novamente o login!" -ForegroundColor Green
