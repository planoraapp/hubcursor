# Script para configurar Supabase automaticamente
Write-Host "🔧 Configurando Supabase..." -ForegroundColor Green

# Criar arquivo .env
$envContent = @"
VITE_SUPABASE_URL=https://wueccgeizznjmjgmuscy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc

SUPABASE_URL=https://wueccgeizznjmjgmuscy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Arquivo .env criado" -ForegroundColor Green

# Fazer link do projeto
Write-Host "🔗 Fazendo link do projeto..." -ForegroundColor Yellow
npx supabase link

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Projeto linkado com sucesso" -ForegroundColor Green
    
    # Reset do banco de dados
    Write-Host "🔄 Resetando banco de dados..." -ForegroundColor Yellow
    npx supabase db reset --linked
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Banco de dados resetado com sucesso!" -ForegroundColor Green
        Write-Host "🎉 Configuração completa!" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erro ao resetar banco de dados" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Erro ao fazer link do projeto" -ForegroundColor Red
}
