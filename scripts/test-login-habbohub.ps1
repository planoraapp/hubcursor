# ========================================
# SCRIPT PARA TESTAR LOGIN HABBOHUB
# ========================================

Write-Host "=== TESTE LOGIN HABBOHUB ===" -ForegroundColor Green
Write-Host ""

Write-Host "Abrindo pagina de teste..." -ForegroundColor Yellow
Start-Process "test-login-habbohub.html"

Write-Host ""
Write-Host "INSTRUCOES:" -ForegroundColor Cyan
Write-Host "1. A pagina de teste foi aberta no navegador" -ForegroundColor White
Write-Host "2. Clique em 'Verificar Usuario' para testar criacao automatica" -ForegroundColor White
Write-Host "3. Clique em 'Fazer Login Completo' para testar login completo" -ForegroundColor White
Write-Host "4. Use as credenciais: habbohub / 151092" -ForegroundColor White
Write-Host ""

Write-Host "ALTERNATIVA - Teste direto no site:" -ForegroundColor Yellow
Write-Host "1. Acesse: http://localhost:5173/login" -ForegroundColor White
Write-Host "2. Digite: habbohub" -ForegroundColor White
Write-Host "3. Digite a senha: 151092" -ForegroundColor White
Write-Host "4. Selecione: Brasil (br)" -ForegroundColor White
Write-Host "5. Clique em 'Verificar Usuario'" -ForegroundColor White
Write-Host ""

Write-Host "A conta habbohub deve ser criada automaticamente!" -ForegroundColor Green
