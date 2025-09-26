# Script para configurar Cloudflare R2 automaticamente
Write-Host "🔧 Configurando Cloudflare R2..." -ForegroundColor Cyan

# Criar arquivo .env.local
$envContent = @"
# Cloudflare R2 Configuration
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://pub-af1b3571db674d6bbef76bd60d2423d3.r2.dev
VITE_CLOUDFLARE_WORKERS_AI_KEY=M7by2KTHyiffiuKDAZ8YeH5eNKRLxMy5HHy_URYb

# Note: Para funcionalidade completa de upload, ainda precisa:
# VITE_CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_here
# VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key_here
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Arquivo .env.local criado!" -ForegroundColor Green
Write-Host "✅ Public URL configurada: https://pub-af1b3571db674d6bbef76bd60d2423d3.r2.dev" -ForegroundColor Green
Write-Host "✅ Workers AI Key configurada" -ForegroundColor Green

Write-Host "`n🚀 Reiniciando servidor..." -ForegroundColor Yellow

# Parar processos Node.js existentes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Aguardar um pouco
Start-Sleep -Seconds 2

# Iniciar servidor
Write-Host "🎵 Iniciando servidor com TraxMachine configurado..." -ForegroundColor Cyan
npm run dev
