# ========================================
# SCRIPT PARA CRIAR CONTA HABBOHUB
# ========================================

Write-Host "🚀 [HABBOHUB] Criando conta habbohub..." -ForegroundColor Green

# Verificar se o arquivo SQL existe
if (!(Test-Path "create-habbohub-account.sql")) {
    Write-Host "❌ [ERRO] Arquivo create-habbohub-account.sql não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "📝 [SQL] Arquivo SQL encontrado" -ForegroundColor Yellow

# Mostrar instruções para executar no Supabase
Write-Host ""
Write-Host "📋 [INSTRUÇÕES] Para criar a conta habbohub:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣ Acesse o Dashboard do Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣ Execute o SQL:" -ForegroundColor White
Write-Host "   - Vá em SQL Editor" -ForegroundColor Yellow
Write-Host "   - Cole o conteúdo de: create-habbohub-account.sql" -ForegroundColor Yellow
Write-Host "   - Execute o comando" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣ Verifique se a conta foi criada:" -ForegroundColor White
Write-Host "   - Execute: SELECT * FROM habbo_accounts WHERE habbo_name = 'habbohub';" -ForegroundColor Yellow
Write-Host ""

# Mostrar o conteúdo do SQL
Write-Host "📄 [SQL] Conteúdo do arquivo:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Get-Content "create-habbohub-account.sql" | ForEach-Object { Write-Host $_ -ForegroundColor White }
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host ""
Write-Host "[CREDENCIAIS] Apos executar o SQL:" -ForegroundColor Magenta
Write-Host "   - Usuário: habbohub" -ForegroundColor White
Write-Host "   - Senha: 151092" -ForegroundColor White
Write-Host "   - Hotel: Brasil (br)" -ForegroundColor White
Write-Host "   - Admin: Sim" -ForegroundColor White
Write-Host ""
Write-Host "[PROXIMO] Execute o SQL no Supabase e teste o login!" -ForegroundColor Green
