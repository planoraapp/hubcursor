# ========================================
# SCRIPT PARA CRIAR CONTA HABBOHUB AUTOMATICAMENTE
# ========================================

Write-Host "=== CRIAR CONTA HABBOHUB AUTOMATICAMENTE ===" -ForegroundColor Green
Write-Host ""

Write-Host "Executando Edge Function para criar conta habbohub..." -ForegroundColor Yellow

try {
    # URL da Edge Function
    $functionUrl = "https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/create-habbohub-auto"
    
    # Fazer requisição para criar a conta
    $response = Invoke-RestMethod -Uri $functionUrl -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ SUCESSO! Conta habbohub criada automaticamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "CREDENCIAIS:" -ForegroundColor Cyan
        Write-Host "- Usuario: $($response.credentials.username)" -ForegroundColor White
        Write-Host "- Senha: $($response.credentials.password)" -ForegroundColor White
        Write-Host "- Hotel: $($response.credentials.hotel)" -ForegroundColor White
        Write-Host "- Admin: $($response.credentials.is_admin)" -ForegroundColor White
        Write-Host ""
        Write-Host "MENSAGEM: $($response.message)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "PRONTO! Agora voce pode fazer login com habbohub / 151092" -ForegroundColor Green
    } else {
        Write-Host "❌ ERRO: $($response.error)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ ERRO ao executar Edge Function:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "TENTATIVA MANUAL:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/create-habbohub-auto" -ForegroundColor White
    Write-Host "2. Use metodo POST" -ForegroundColor White
    Write-Host "3. Ou execute o SQL manualmente no Supabase" -ForegroundColor White
}
