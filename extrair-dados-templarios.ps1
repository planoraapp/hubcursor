# Script PowerShell para extrair dados do HabboTemplarios
# Este script abre o navegador, navega para o site e executa a extração

Write-Host "�� Iniciando extração de dados do HabboTemplarios..." -ForegroundColor Green

# Verificar se o Chrome está instalado
$chromePath = Get-Command "chrome" -ErrorAction SilentlyContinue
if (-not $chromePath) {
    $chromePath = Get-Command "msedge" -ErrorAction SilentlyContinue
}

if (-not $chromePath) {
    Write-Host "❌ Chrome ou Edge não encontrado. Instale um deles para continuar." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Navegador encontrado: $($chromePath.Source)" -ForegroundColor Green

# URL do HabboTemplarios
$url = "https://habbotemplarios.com/generador-de-habbos"

Write-Host "�� Abrindo $url..." -ForegroundColor Yellow

# Abrir o navegador
Start-Process $chromePath.Source -ArgumentList $url

Write-Host "�� Instruções:" -ForegroundColor Cyan
Write-Host "1. Aguarde o site carregar completamente" -ForegroundColor White
Write-Host "2. Abra o console do navegador (F12)" -ForegroundColor White
Write-Host "3. Cole e execute o script extrair-dados-templarios.js" -ForegroundColor White
Write-Host "4. O arquivo será baixado automaticamente" -ForegroundColor White

Write-Host "`n💡 Dica: Se o script não funcionar, tente:" -ForegroundColor Yellow
Write-Host "- Recarregar a página (F5)" -ForegroundColor White
Write-Host "- Aguardar o editor carregar completamente" -ForegroundColor White
Write-Host "- Verificar se não há erros no console" -ForegroundColor White

Read-Host "`nPressione Enter quando terminar a extração"
