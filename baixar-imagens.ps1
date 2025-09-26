# Script para baixar imagens corretas do habbo-hub.com
# Este script baixa as imagens exatas que estão sendo usadas no site

Write-Host "🖼️  Baixando imagens corretas do habbo-hub.com..." -ForegroundColor Green
Write-Host "📁 Pasta de destino: $PWD\public\assets" -ForegroundColor Cyan
Write-Host ""

# Criar pasta de backup das imagens antigas
$backupFolder = "assets-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
if (!(Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Name $backupFolder
    Write-Host "📦 Criada pasta de backup: $backupFolder" -ForegroundColor Yellow
}

# Lista de imagens para baixar do site habbo-hub.com
$imagesToDownload = @(
    # Logos principais
    @{url="https://habbo-hub.com/assets/habbohub-logo.png"; filename="habbohub-logo.png"},
    @{url="https://habbo-hub.com/assets/hub-icon.png"; filename="hub-icon.png"},
    @{url="https://habbo-hub.com/assets/favicon.ico"; filename="favicon.ico"},
    
    # Ícones da sidebar
    @{url="https://habbo-hub.com/assets/icons/home.png"; filename="home.png"},
    @{url="https://habbo-hub.com/assets/icons/console.png"; filename="console.png"},
    @{url="https://habbo-hub.com/assets/icons/homes.png"; filename="homes.png"},
    @{url="https://habbo-hub.com/assets/icons/news.png"; filename="news.png"},
    @{url="https://habbo-hub.com/assets/icons/badges.png"; filename="emblemas.png"},
    @{url="https://habbo-hub.com/assets/icons/catalog.png"; filename="catalogo.png"},
    @{url="https://habbo-hub.com/assets/icons/tools.png"; filename="ferramentas.png"},
    @{url="https://habbo-hub.com/assets/icons/events.png"; filename="eventos.png"},
    @{url="https://habbo-hub.com/assets/icons/marketplace.png"; filename="mercado.png"},
    
    # Backgrounds
    @{url="https://habbo-hub.com/assets/backgrounds/main-bg.png"; filename="bghabbohub.png"},
    @{url="https://habbo-hub.com/assets/backgrounds/console-bg.png"; filename="console-bg.png"},
    @{url="https://habbo-hub.com/assets/backgrounds/homes-bg.png"; filename="homes-bg.png"},
    
    # Elementos de UI
    @{url="https://habbo-hub.com/assets/ui/button-bg.png"; filename="button-bg.png"},
    @{url="https://habbo-hub.com/assets/ui/card-bg.png"; filename="card-bg.png"},
    @{url="https://habbo-hub.com/assets/ui/sidebar-bg.png"; filename="sidebar-bg.png"}
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

# Baixar todas as imagens
Write-Host "🚀 Iniciando download das imagens..." -ForegroundColor Green
Write-Host ""

foreach ($image in $imagesToDownload) {
    Download-Image -url $image.url -filename $image.filename
    Start-Sleep -Milliseconds 500  # Pausa entre downloads
}

Write-Host ""
Write-Host "🎉 Download concluído!" -ForegroundColor Green
Write-Host "📁 Imagens antigas salvas em: $backupFolder" -ForegroundColor Yellow
Write-Host "🔄 Agora você pode atualizar o site com as imagens corretas!" -ForegroundColor Cyan

# Mostrar estatísticas
$totalImages = $imagesToDownload.Count
$downloadedImages = (Get-ChildItem "public\assets" -File | Where-Object {$_.Name -in $imagesToDownload.filename}).Count

Write-Host ""
Write-Host "📊 Estatísticas:" -ForegroundColor White
Write-Host "   Total de imagens: $totalImages" -ForegroundColor White
Write-Host "   Baixadas com sucesso: $downloadedImages" -ForegroundColor White
Write-Host "   Falhas: $($totalImages - $downloadedImages)" -ForegroundColor White
