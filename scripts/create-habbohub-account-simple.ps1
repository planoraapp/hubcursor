# ========================================
# SCRIPT SIMPLES PARA CRIAR CONTA HABBOHUB
# ========================================

Write-Host "=== CRIAR CONTA HABBOHUB ===" -ForegroundColor Green
Write-Host ""

Write-Host "INSTRUCOES:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy" -ForegroundColor Yellow
Write-Host "2. Va em SQL Editor" -ForegroundColor Yellow
Write-Host "3. Cole o SQL abaixo:" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== SQL PARA EXECUTAR ===" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# Mostrar o conteúdo do arquivo SQL
if (Test-Path "create-habbohub-account.sql") {
    Get-Content "create-habbohub-account.sql" | ForEach-Object { 
        Write-Host $_ -ForegroundColor White 
    }
} else {
    Write-Host "Arquivo create-habbohub-account.sql nao encontrado!" -ForegroundColor Red
}

Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

Write-Host "CREDENCIAIS APOS EXECUTAR:" -ForegroundColor Magenta
Write-Host "- Usuario: habbohub" -ForegroundColor White
Write-Host "- Senha: 151092" -ForegroundColor White
Write-Host "- Hotel: Brasil (br)" -ForegroundColor White
Write-Host "- Admin: Sim" -ForegroundColor White
Write-Host ""

Write-Host "PRONTO! Execute o SQL no Supabase e teste o login." -ForegroundColor Green
