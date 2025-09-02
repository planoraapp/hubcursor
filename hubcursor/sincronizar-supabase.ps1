# Script para sincronizar imagens no Supabase
Write-Host "Sincronizando imagens no Supabase..." -ForegroundColor Green

# Verificar se temos as imagens do Cloudflare
$cloudflareFolder = "public\assets\cloudflare"
$supabaseFolder = "public\assets\supabase"

if (!(Test-Path $cloudflareFolder)) {
    Write-Host "Pasta do Cloudflare nao encontrada!" -ForegroundColor Red
    exit
}

# Criar pasta do Supabase se nao existir
if (!(Test-Path $supabaseFolder)) {
    New-Item -ItemType Directory -Name $supabaseFolder -Force
    Write-Host "Criada pasta: $supabaseFolder" -ForegroundColor Yellow
}

# Listar imagens do Cloudflare
$cloudflareImages = Get-ChildItem $cloudflareFolder -File | Where-Object {$_.Extension -match '\.(png|jpg|jpeg|gif|ico)$'}

Write-Host "Encontradas $($cloudflareImages.Count) imagens no Cloudflare" -ForegroundColor Cyan

# Copiar para pasta do Supabase
foreach ($image in $cloudflareImages) {
    $sourcePath = $image.FullName
    $destPath = Join-Path $supabaseFolder $image.Name
    
    try {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "Copiado: $($image.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Erro ao copiar: $($image.Name)" -ForegroundColor Red
    }
}

# Verificar se temos imagens antigas para backup
$oldImages = Get-ChildItem "public\assets" -File | Where-Object {$_.Extension -match '\.(png|jpg|jpeg|gif|ico)$' -and $_.Directory.Name -eq 'assets'}

if ($oldImages.Count -gt 0) {
    $backupFolder = "assets-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Name $backupFolder -Force
    
    Write-Host "Fazendo backup de $($oldImages.Count) imagens antigas..." -ForegroundColor Yellow
    
    foreach ($image in $oldImages) {
        $backupPath = Join-Path $backupFolder $image.Name
        Copy-Item $image.FullName $backupPath
        Write-Host "Backup: $($image.Name)" -ForegroundColor Blue
    }
    
    Write-Host "Backup salvo em: $backupFolder" -ForegroundColor Green
}

Write-Host ""
Write-Host "Sincronizacao concluida!" -ForegroundColor Green
Write-Host "Imagens do Cloudflare: $cloudflareFolder" -ForegroundColor White
Write-Host "Imagens do Supabase: $supabaseFolder" -ForegroundColor White
Write-Host "Total de imagens: $($cloudflareImages.Count)" -ForegroundColor White
