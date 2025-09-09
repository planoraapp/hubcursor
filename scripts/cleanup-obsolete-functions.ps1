# Script para remover edge functions obsoletas do Supabase
# Execute este script após testar a API unificada

Write-Host "🧹 Iniciando limpeza das edge functions obsoletas..." -ForegroundColor Yellow

# Lista de funções obsoletas para remover
$obsoleteFunctions = @(
    "habbo-feed",
    "habbo-figuredata", 
    "get-habbo-figures",
    "get-habbo-official-data",
    "get-official-habbo-assets",
    "get-official-habbo-clothing",
    "habbo-badges-scraper",
    "habbo-badges-storage", 
    "habbo-badges-validator",
    "habbo-change-detector",
    "habbo-change-scheduler",
    "habbo-emotion-badges",
    "habbo-emotion-clothing",
    "habbo-emotion-furnis",
    "puhekupla-proxy",
    "habbo-news-scraper",
    "habbo-hotel-feed",
    "habbo-hotel-general-feed",
    "create-beebop-test-account",
    "setup-beebop-admin",
    "templarios-scraper",
    "templarios-figuredata"
)

# Verificar se o Supabase CLI está instalado
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado. Instale primeiro:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Verificar se está logado no Supabase
try {
    $user = supabase projects list
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✅ Logado no Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Não está logado no Supabase. Faça login primeiro:" -ForegroundColor Red
    Write-Host "supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "⚠️  ATENÇÃO: Este script irá remover $($obsoleteFunctions.Count) edge functions obsoletas!" -ForegroundColor Red
Write-Host "Certifique-se de que a API unificada está funcionando corretamente antes de continuar." -ForegroundColor Yellow

$confirmation = Read-Host "Deseja continuar? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "❌ Operação cancelada pelo usuário" -ForegroundColor Yellow
    exit 0
}

# Fazer backup das funções antes de remover
$backupDir = "backup-edge-functions-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "📦 Criando backup em: $backupDir" -ForegroundColor Blue

if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

# Copiar funções para backup
foreach ($func in $obsoleteFunctions) {
    $sourcePath = "supabase/functions/$func"
    $backupPath = "$backupDir/$func"
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $backupPath -Recurse
        Write-Host "📋 Backup criado: $func" -ForegroundColor Gray
    }
}

Write-Host "✅ Backup concluído em: $backupDir" -ForegroundColor Green

# Remover funções obsoletas
$removedCount = 0
foreach ($func in $obsoleteFunctions) {
    $funcPath = "supabase/functions/$func"
    
    if (Test-Path $funcPath) {
        try {
            Remove-Item -Path $funcPath -Recurse -Force
            Write-Host "🗑️  Removido: $func" -ForegroundColor Red
            $removedCount++
        } catch {
            Write-Host "❌ Erro ao remover $func : $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Função não encontrada: $func" -ForegroundColor Yellow
    }
}

Write-Host "📊 Resumo da limpeza:" -ForegroundColor Blue
Write-Host "- Funções removidas: $removedCount" -ForegroundColor Green
Write-Host "- Backup criado em: $backupDir" -ForegroundColor Green

# Deploy das mudanças
Write-Host "🚀 Fazendo deploy das mudanças..." -ForegroundColor Blue
try {
    supabase functions deploy
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no deploy: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Você pode restaurar as funções do backup se necessário" -ForegroundColor Yellow
}

Write-Host "🎉 Limpeza concluída!" -ForegroundColor Green
Write-Host "💡 Teste o site para garantir que tudo está funcionando" -ForegroundColor Yellow
