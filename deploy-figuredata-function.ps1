# Script para fazer deploy da Edge Function habbo-figuredata
Write-Host "🚀 Fazendo deploy da Edge Function habbo-figuredata..." -ForegroundColor Green

# Verificar se supabase CLI está instalado
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado. Instalando..." -ForegroundColor Red
    Write-Host "Execute: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Navegar para o diretório do projeto
Set-Location "habbo-hub"

# Fazer login no Supabase (se necessário)
Write-Host "🔐 Verificando login no Supabase..." -ForegroundColor Blue
try {
    supabase status
} catch {
    Write-Host "⚠️ Não logado. Execute: supabase login" -ForegroundColor Yellow
    Write-Host "Depois execute este script novamente." -ForegroundColor Yellow
    exit 1
}

# Fazer deploy da função
Write-Host "📦 Fazendo deploy da função habbo-figuredata..." -ForegroundColor Blue
try {
    supabase functions deploy habbo-figuredata
    Write-Host "✅ Deploy realizado com sucesso!" -ForegroundColor Green
    Write-Host "🌐 URL da função: https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-figuredata" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro no deploy: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Edge Function habbo-figuredata deployada com sucesso!" -ForegroundColor Green
Write-Host "Agora o editor pode acessar os dados oficiais do Habbo sem problemas de CORS." -ForegroundColor Cyan
