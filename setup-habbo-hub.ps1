# Script Automatico para Configurar HabboHub
# Este script baixa o projeto do GitHub e configura tudo automaticamente

Write-Host "Iniciando configuracao automatica do HabboHub..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Definir caminhos
$documentsPath = [Environment]::GetFolderPath("MyDocuments")
$projectPath = Join-Path $documentsPath "HabboHub"
$backupPath = Join-Path $documentsPath "HabboHub-Backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "📁 Pasta de destino: $projectPath" -ForegroundColor Yellow

# Verificar se Git está instalado
Write-Host "🔍 Verificando se Git está instalado..." -ForegroundColor Blue
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado! Instalando..." -ForegroundColor Red
    Write-Host "Por favor, instale o Git primeiro: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Pressione Enter após instalar o Git"
}

# Verificar se Node.js está instalado
Write-Host "🔍 Verificando se Node.js está instalado..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado! Instalando..." -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js primeiro: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Pressione Enter após instalar o Node.js"
}

# Criar pasta de backup se o projeto já existir
if (Test-Path $projectPath) {
    Write-Host "📦 Projeto já existe! Criando backup..." -ForegroundColor Yellow
    Move-Item $projectPath $backupPath
    Write-Host "✅ Backup criado em: $backupPath" -ForegroundColor Green
}

# Criar pasta do projeto
Write-Host "📁 Criando pasta do projeto..." -ForegroundColor Blue
New-Item -ItemType Directory -Path $projectPath -Force | Out-Null

# Navegar para a pasta
Set-Location $projectPath

# Clonar repositório
Write-Host "📥 Baixando projeto do GitHub..." -ForegroundColor Blue
try {
    git clone https://github.com/planoraapp/hubcursor.git .
    Write-Host "✅ Projeto baixado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao baixar o projeto: $_" -ForegroundColor Red
    Read-Host "Pressione Enter para continuar"
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
try {
    npm install
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências: $_" -ForegroundColor Red
    Write-Host "Tentando com --force..." -ForegroundColor Yellow
    npm install --force
}

# Criar arquivo .env
Write-Host "⚙️ Criando arquivo de configuração..." -ForegroundColor Blue
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
Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green

# Criar scripts de automação
Write-Host "🔧 Criando scripts de automação..." -ForegroundColor Blue

# Script para sincronizar com GitHub
$syncScript = @"
# Script para sincronizar mudanças com o GitHub
Write-Host "🔄 Sincronizando com GitHub..." -ForegroundColor Green

# Verificar se há mudanças
`$changes = git status --porcelain
if (`$changes) {
    # Adicionar todas as mudanças
    git add .
    
    # Fazer commit com mensagem
    `$commitMessage = Read-Host "Digite a mensagem do commit"
    if (`$commitMessage) {
        git commit -m `$commitMessage
        
        # Enviar para o GitHub
        git push origin main
        
        Write-Host "✅ Sincronização concluída!" -ForegroundColor Green
    } else {
        Write-Host "❌ Commit cancelado!" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️ Nenhuma mudança para sincronizar!" -ForegroundColor Yellow
}
"@

$syncScript | Out-File -FilePath "sync-to-github.ps1" -Encoding UTF8

# Script para baixar atualizações
$pullScript = @"
# Script para baixar atualizações do GitHub
Write-Host "📥 Baixando atualizações do GitHub..." -ForegroundColor Blue

try {
    # Baixar mudanças
    git pull origin main
    
    # Reinstalar dependências se package.json mudou
    `$packageChanged = git diff HEAD~1 HEAD --name-only | Select-String "package.json"
    if (`$packageChanged) {
        Write-Host "📦 Reinstalando dependências..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "✅ Atualizações baixadas!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao baixar atualizações: `$_" -ForegroundColor Red
}
"@

$pullScript | Out-File -FilePath "pull-from-github.ps1" -Encoding UTF8

# Script para iniciar desenvolvimento
$startScript = @"
# Script para iniciar desenvolvimento
Write-Host "🚀 Iniciando HabboHub..." -ForegroundColor Cyan

# Verificar se node_modules existe
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Verificar se .env existe
if (!(Test-Path ".env")) {
    Write-Host "⚠️ Arquivo .env não encontrado! Criando..." -ForegroundColor Yellow
    @"
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Habbo API Configuration
VITE_HABBO_API_BASE_URL=https://www.habbo.com.br
VITE_HABBO_FIGUREDATA_URL=https://www.habbo.com.br/gamedata/figuredata

# Development
VITE_APP_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

# Iniciar servidor de desenvolvimento
Write-Host "🌐 Abrindo http://localhost:5173..." -ForegroundColor Green
npm run dev
"@

$startScript | Out-File -FilePath "start-dev.ps1" -Encoding UTF8

# Script para build de produção
$buildScript = @"
# Script para build de produção
Write-Host "🏗️ Fazendo build de produção..." -ForegroundColor Blue

try {
    npm run build
    Write-Host "✅ Build concluído! Arquivos em ./dist/" -ForegroundColor Green
    Write-Host "📁 Para testar o build: npm run preview" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Erro no build: `$_" -ForegroundColor Red
}
"@

$buildScript | Out-File -FilePath "build-production.ps1" -Encoding UTF8

Write-Host "✅ Scripts de automação criados!" -ForegroundColor Green

# Criar atalho na área de trabalho
Write-Host "🔗 Criando atalho na área de trabalho..." -ForegroundColor Blue
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "HabboHub.lnk"

$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoExit -Command `"cd '$projectPath'; .\start-dev.ps1`""
$Shortcut.WorkingDirectory = $projectPath
$Shortcut.Description = "Iniciar HabboHub"
$Shortcut.Save()

Write-Host "✅ Atalho criado na área de trabalho!" -ForegroundColor Green

# Mostrar resumo
Write-Host ""
Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "📁 Projeto instalado em: $projectPath" -ForegroundColor White
Write-Host "🔗 Atalho criado na área de trabalho" -ForegroundColor White
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Configure o arquivo .env com suas credenciais do Supabase" -ForegroundColor White
Write-Host "2. Clique no atalho 'HabboHub' na área de trabalho" -ForegroundColor White
Write-Host "3. Ou execute: .\start-dev.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🔧 SCRIPTS DISPONÍVEIS:" -ForegroundColor Yellow
Write-Host "• start-dev.ps1 - Iniciar desenvolvimento" -ForegroundColor White
Write-Host "• sync-to-github.ps1 - Sincronizar com GitHub" -ForegroundColor White
Write-Host "• pull-from-github.ps1 - Baixar atualizações" -ForegroundColor White
Write-Host "• build-production.ps1 - Build para produção" -ForegroundColor White
Write-Host ""
Write-Host "🌐 O site estará disponível em: http://localhost:5173" -ForegroundColor Cyan

# Perguntar se quer iniciar agora
$startNow = Read-Host "Deseja iniciar o HabboHub agora? (s/n)"
if ($startNow -eq "s" -or $startNow -eq "S" -or $startNow -eq "sim") {
    Write-Host "🚀 Iniciando HabboHub..." -ForegroundColor Green
    .\start-dev.ps1
} else {
    Write-Host "✅ Configuração finalizada! Execute .\start-dev.ps1 quando quiser iniciar." -ForegroundColor Green
}
