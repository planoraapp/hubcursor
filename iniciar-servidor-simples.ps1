# Script simples para iniciar o servidor
Write-Host "🚀 INICIANDO SERVIDOR HABBO HUB" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: Execute este script no diretório hubcursor/" -ForegroundColor Red
    Write-Host "Execute: cd hubcursor" -ForegroundColor Yellow
    exit 1
}

# Parar processos existentes na porta 8080
Write-Host "🛑 Parando processos existentes na porta 8080..." -ForegroundColor Yellow
$processos = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($processos) {
    foreach ($pid in $processos) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Processo $pid parado" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Não foi possível parar processo $pid" -ForegroundColor Yellow
        }
    }
}

# Instalar dependências se necessário
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

Write-Host "`n🚀 Iniciando servidor na porta 8080..." -ForegroundColor Blue
Write-Host "Acesse: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Editor: http://localhost:8080/ferramentas/avatar-editor" -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray

# Iniciar o servidor
npm run dev