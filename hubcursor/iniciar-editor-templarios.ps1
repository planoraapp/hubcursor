# Script para iniciar o editor com dados do HabboTemplarios
Write-Host "🚀 Iniciando Editor de Avatar com HabboTemplarios..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório hubcursor/" -ForegroundColor Red
    exit 1
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Verificar se os arquivos necessários existem
$arquivosNecessarios = @(
    "src/data/habboTemplariosData.ts",
    "src/components/tools/AvatarEditorWithTemplarios.tsx"
)

foreach ($arquivo in $arquivosNecessarios) {
    if (-not (Test-Path $arquivo)) {
        Write-Host "❌ Arquivo não encontrado: $arquivo" -ForegroundColor Red
        Write-Host "Execute os comandos de criação dos arquivos primeiro!" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ Todos os arquivos estão presentes!" -ForegroundColor Green
Write-Host "�� Iniciando servidor de desenvolvimento..." -ForegroundColor Blue

# Iniciar o servidor
npm run dev
