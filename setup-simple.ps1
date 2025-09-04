# Script Simples para Configurar HabboHub
Write-Host "Iniciando configuracao do HabboHub..." -ForegroundColor Green

# Definir caminhos
$documentsPath = [Environment]::GetFolderPath("MyDocuments")
$projectPath = Join-Path $documentsPath "HabboHub"

Write-Host "Pasta de destino: $projectPath" -ForegroundColor Yellow

# Criar pasta se nao existir
if (!(Test-Path $projectPath)) {
    New-Item -ItemType Directory -Path $projectPath -Force | Out-Null
    Write-Host "Pasta criada: $projectPath" -ForegroundColor Green
}

# Navegar para a pasta
Set-Location $projectPath

# Clonar repositorio
Write-Host "Baixando projeto do GitHub..." -ForegroundColor Blue
git clone https://github.com/planoraapp/hubcursor.git .

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Blue
npm install

# Criar arquivo .env
Write-Host "Criando arquivo de configuracao..." -ForegroundColor Blue
$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Habbo API Configuration
VITE_HABBO_API_BASE_URL=https://www.habbo.com.br
VITE_HABBO_FIGUREDATA_URL=https://www.habbo.com.br/gamedata/figuredata

# Development
VITE_APP_ENV=development
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host "Projeto instalado em: $projectPath" -ForegroundColor White
Write-Host "Execute: npm run dev" -ForegroundColor Yellow
