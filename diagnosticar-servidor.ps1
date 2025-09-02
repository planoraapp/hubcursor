# Script de diagnóstico completo
Write-Host "�� DIAGNÓSTICO DO SERVIDOR HABBO HUB" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Verificar diretório atual
Write-Host "`n📁 Diretório atual:" -ForegroundColor Yellow
Write-Host (Get-Location).Path

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: Não estamos no diretório correto!" -ForegroundColor Red
    Write-Host "Execute: cd hubcursor" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Estamos no diretório correto (package.json encontrado)" -ForegroundColor Green

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "❌ node_modules não encontrado!" -ForegroundColor Red
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
}

# Verificar arquivos importantes
Write-Host "`n📋 Verificando arquivos importantes:" -ForegroundColor Yellow
$arquivos = @(
    "src/data/habboTemplariosData.ts",
    "src/components/tools/AvatarEditorWithTemplarios.tsx",
    "src/components/tools/AvatarEditor.tsx",
    "vite.config.ts"
)

foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        Write-Host "✅ $arquivo" -ForegroundColor Green
    } else {
        Write-Host "❌ $arquivo" -ForegroundColor Red
    }
}

# Verificar se há processos rodando nas portas
Write-Host "`n�� Verificando portas:" -ForegroundColor Yellow

$porta8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
$porta5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($porta8080) {
    Write-Host "✅ Porta 8080 está em uso (servidor provavelmente rodando)" -ForegroundColor Green
} else {
    Write-Host "❌ Porta 8080 não está em uso" -ForegroundColor Red
}

if ($porta5173) {
    Write-Host "✅ Porta 5173 está em uso" -ForegroundColor Green
} else {
    Write-Host "❌ Porta 5173 não está em uso" -ForegroundColor Red
}

# Verificar configuração do Vite
Write-Host "`n⚙️ Configuração do Vite:" -ForegroundColor Yellow
$viteConfig = Get-Content "vite.config.ts" | Select-String "port"
if ($viteConfig) {
    Write-Host "Porta configurada: $viteConfig" -ForegroundColor Cyan
}

Write-Host "`n�� INSTRUÇÕES:" -ForegroundColor Green
Write-Host "1. Execute: npm run dev" -ForegroundColor White
Write-Host "2. Acesse: http://localhost:8080 (NÃO 5173!)" -ForegroundColor White
Write-Host "3. Vá para: Tools > Avatar Editor > HabboTemplarios" -ForegroundColor White

Write-Host "`n🔧 Se ainda não funcionar:" -ForegroundColor Yellow
Write-Host "Execute: npm run dev --verbose" -ForegroundColor White
