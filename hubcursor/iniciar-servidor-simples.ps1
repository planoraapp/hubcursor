# Script Simples para Iniciar o Servidor
Write-Host "🚀 Iniciando servidor HabboHub..." -ForegroundColor Green

# Verificar se estamos na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Execute este script na pasta 'hubcursor'" -ForegroundColor Red
    pause
    exit
}

# Verificar Node.js
try {
    node --version | Out-Null
    Write-Host "✅ Node.js OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Instale Node.js: https://nodejs.org/" -ForegroundColor Red
    pause
    exit
}

# Instalar dependências se necessário
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Iniciar servidor
Write-Host "🌐 Iniciando servidor em http://localhost:8080" -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""
npm run dev
