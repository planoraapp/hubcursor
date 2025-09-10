# ========================================
# SCRIPT PARA TESTAR CRIAÇÃO AUTOMÁTICA DA CONTA HABBOHUB
# ========================================

Write-Host "=== TESTE CRIAÇÃO AUTOMÁTICA CONTA HABBOHUB ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. Abrindo página de teste..." -ForegroundColor Yellow
Start-Process "test-habbohub-account.html"

Write-Host "2. Aguardando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "3. Testando criação via API..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts" -Method GET -Headers @{
        "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyMzQ0NzQ5MCwiZXhwIjoyMDM5MDIzNDkwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq"
        "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyMzQ0NzQ5MCwiZXhwIjoyMDM5MDIzNDkwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq"
    } -ContentType "application/json"

    $habbohubAccount = $response | Where-Object { $_.habbo_name -eq "habbohub" }
    
    if ($habbohubAccount) {
        Write-Host "✅ CONTA HABBOHUB ENCONTRADA!" -ForegroundColor Green
        Write-Host "   - Nome: $($habbohubAccount.habbo_name)" -ForegroundColor White
        Write-Host "   - Hotel: $($habbohubAccount.hotel)" -ForegroundColor White
        Write-Host "   - Admin: $($habbohubAccount.is_admin)" -ForegroundColor White
        Write-Host "   - Criada em: $($habbohubAccount.created_at)" -ForegroundColor White
    } else {
        Write-Host "❌ CONTA HABBOHUB NÃO ENCONTRADA" -ForegroundColor Red
        Write-Host "   Total de contas: $($response.Count)" -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "Tentando criar conta automaticamente..." -ForegroundColor Yellow
        
        $createResponse = Invoke-RestMethod -Uri "https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts" -Method POST -Headers @{
            "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyMzQ0NzQ5MCwiZXhwIjoyMDM5MDIzNDkwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq"
            "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyMzQ0NzQ5MCwiZXhwIjoyMDM5MDIzNDkwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq"
            "Prefer" = "return=representation"
        } -Body (@{
            habbo_name = "habbohub"
            hotel = "br"
            figure_string = "hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61"
            motto = "Sistema HabboHub - Administrador"
            is_admin = $true
            is_online = $false
        } | ConvertTo-Json) -ContentType "application/json"
        
        if ($createResponse) {
            Write-Host "✅ CONTA HABBOHUB CRIADA COM SUCESSO!" -ForegroundColor Green
            Write-Host "   - Nome: $($createResponse.habbo_name)" -ForegroundColor White
            Write-Host "   - Hotel: $($createResponse.hotel)" -ForegroundColor White
            Write-Host "   - Admin: $($createResponse.is_admin)" -ForegroundColor White
        } else {
            Write-Host "❌ ERRO AO CRIAR CONTA" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Acesse: http://localhost:5173/login" -ForegroundColor White
Write-Host "2. Digite: habbohub" -ForegroundColor White
Write-Host "3. Digite a senha: 151092" -ForegroundColor White
Write-Host "4. Selecione: Brasil (br)" -ForegroundColor White
Write-Host "5. Clique em 'Verificar Usuário'" -ForegroundColor White
Write-Host ""
Write-Host "A conta deve ser encontrada automaticamente!" -ForegroundColor Green
