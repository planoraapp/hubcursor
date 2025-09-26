# Script para baixar imagens corretas do Supabase
# Este script baixa as imagens exatas que estão sendo usadas no site habbo-hub.com

Write-Host "🖼️  Baixando imagens corretas do Supabase..." -ForegroundColor Green
Write-Host "📁 Pasta de destino: $PWD\public\assets" -ForegroundColor Cyan
Write-Host "☁️  Bucket: wueccgeizznjmjgmuscy" -ForegroundColor Yellow
Write-Host ""

# Criar pasta de backup das imagens antigas
$backupFolder = "assets-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
if (!(Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Name $backupFolder
    Write-Host "📦 Criada pasta de backup: $backupFolder" -ForegroundColor Yellow
}

# URLs do Supabase para as imagens corretas
# Baseado no bucket: wueccgeizznjmjgmuscy
$supabaseBaseUrl = "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public"

# Lista de imagens para baixar do Supabase
$imagesToDownload = @(
    # Logos principais
    @{url="$supabaseBaseUrl/assets/habbohub-logo.png"; filename="habbohub-logo.png"},
    @{url="$supabaseBaseUrl/assets/hub-icon.png"; filename="hub-icon.png"},
    @{url="$supabaseBaseUrl/assets/favicon.ico"; filename="favicon.ico"},
    
    # Ícones da sidebar
    @{url="$supabaseBaseUrl/assets/icons/home.png"; filename="home.png"},
    @{url="$supabaseBaseUrl/assets/icons/console.png"; filename="console.png"},
    @{url="$supabaseBaseUrl/assets/icons/homes.png"; filename="homes.png"},
    @{url="$supabaseBaseUrl/assets/icons/news.png"; filename="news.png"},
    @{url="$supabaseBaseUrl/assets/icons/badges.png"; filename="emblemas.png"},
    @{url="$supabaseBaseUrl/assets/icons/catalog.png"; filename="catalogo.png"},
    @{url="$supabaseBaseUrl/assets/icons/tools.png"; filename="ferramentas.png"},
    @{url="$supabaseBaseUrl/assets/icons/events.png"; filename="eventos.png"},
    @{url="$supabaseBaseUrl/assets/icons/marketplace.png"; filename="mercado.png"},
    
    # Backgrounds
    @{url="$supabaseBaseUrl/assets/backgrounds/main-bg.png"; filename="bghabbohub.png"},
    @{url="$supabaseBaseUrl/assets/backgrounds/console-bg.png"; filename="console-bg.png"},
    @{url="$supabaseBaseUrl/assets/backgrounds/homes-bg.png"; filename="homes-bg.png"},
    
    # Elementos de UI
    @{url="$supabaseBaseUrl/assets/ui/button-bg.png"; filename="button-bg.png"},
    @{url="$supabaseBaseUrl/assets/ui/card-bg.png"; filename="card-bg.png"},
    @{url="$supabaseBaseUrl/assets/ui/sidebar-bg.png"; filename="sidebar-bg.png"},
    
    # Imagens específicas do Habbo
    @{url="$supabaseBaseUrl/assets/habbo/avatar-placeholder.png"; filename="avatar-placeholder.png"},
    @{url="$supabaseBaseUrl/assets/habbo/room-preview.png"; filename="room-preview.png"},
    @{url="$supabaseBaseUrl/assets/habbo/badge-icon.png"; filename="badge-icon.png"}
)

# Função para baixar imagem
function Download-Image {
    param($url, $filename)
    
    try {
        $outputPath = Join-Path "public\assets" $filename
        
        # Fazer backup da imagem existente
        if (Test-Path $outputPath) {
            $backupPath = Join-Path $backupFolder $filename
            Copy-Item $outputPath $backupPath
            Write-Host "💾 Backup criado: $filename" -ForegroundColor Yellow
        }
        
        # Baixar nova imagem
        Write-Host "⬇️  Baixando: $filename" -ForegroundColor Blue
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing
        
        if (Test-Path $outputPath) {
            $fileSize = (Get-Item $outputPath).Length
            Write-Host "✅ Baixado: $filename ($([math]::Round($fileSize/1KB, 2)) KB)" -ForegroundColor Green
        } else {
            Write-Host "❌ Falha ao baixar: $filename" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erro ao baixar $filename`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Função para tentar URLs alternativas
function Try-AlternativeUrls {
    param($filename)
    
    $alternativeUrls = @(
        "https://habbo-hub.com/assets/$filename",
        "https://habbo-hub.com/images/$filename",
        "https://habbo-hub.com/img/$filename",
        "https://habbo-hub.com/static/$filename"
    )
    
    foreach ($altUrl in $alternativeUrls) {
        try {
            Write-Host "🔄 Tentando URL alternativa: $altUrl" -ForegroundColor Yellow
            $outputPath = Join-Path "public\assets" $filename
            Invoke-WebRequest -Uri $altUrl -OutFile $outputPath -UseBasicParsing -TimeoutSec 10
            
            if (Test-Path $outputPath) {
                $fileSize = (Get-Item $outputPath).Length
                Write-Host "✅ Baixado via alternativa: $filename ($([math]::Round($fileSize/1KB, 2)) KB)" -ForegroundColor Green
                return $true
            }
        }
        catch {
            Write-Host "❌ Falha na alternativa: $altUrl" -ForegroundColor Red
        }
    }
    return $false
}

# Baixar todas as imagens
Write-Host "🚀 Iniciando download das imagens do Supabase..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$totalCount = $imagesToDownload.Count

foreach ($image in $imagesToDownload) {
    try {
        Download-Image -url $image.url -filename $image.filename
        $successCount++
    }
    catch {
        Write-Host "🔄 Tentando URLs alternativas para: $($image.filename)" -ForegroundColor Yellow
        if (Try-AlternativeUrls -filename $image.filename) {
            $successCount++
        }
    }
    
    Start-Sleep -Milliseconds 300  # Pausa entre downloads
}

Write-Host ""
Write-Host "🎉 Download concluído!" -ForegroundColor Green
Write-Host "📁 Imagens antigas salvas em: $backupFolder" -ForegroundColor Yellow
Write-Host "🔄 Agora você pode atualizar o site com as imagens corretas!" -ForegroundColor Cyan

# Mostrar estatísticas
Write-Host ""
Write-Host "📊 Estatísticas:" -ForegroundColor White
Write-Host "   Total de imagens: $totalCount" -ForegroundColor White
Write-Host "   Baixadas com sucesso: $successCount" -ForegroundColor White
Write-Host "   Falhas: $($totalCount - $successCount)" -ForegroundColor White

# Verificar se as imagens principais foram baixadas
$mainImages = @("habbohub-logo.png", "home.png", "console.png", "bghabbohub.png")
$missingImages = @()

foreach ($img in $mainImages) {
    $imgPath = Join-Path "public\assets" $img
    if (!(Test-Path $imgPath)) {
        $missingImages += $img
    }
}

if ($missingImages.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Imagens principais em falta:" -ForegroundColor Red
    foreach ($img in $missingImages) {
        Write-Host "   ❌ $img" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "💡 Dica: Verifique se as URLs do Supabase estão corretas" -ForegroundColor Yellow
}
