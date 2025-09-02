# Script para baixar imagens do Cloudflare R2
Write-Host "Baixando imagens do Cloudflare R2..." -ForegroundColor Green

# URLs encontradas no JavaScript
$cloudflareImages = @(
    "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/de84c967-0daa-4cb3-93e4-3ac057cc2e46/id-preview-76e8ace6--46846548-2217-4eb3-8642-0e834c98ce0c.lovable.app-1756383541442.png",
    "https://i.imgur.com/1BGBH0d.png",
    "https://i.imgur.com/IGVknDZ.png",
    "https://i.imgur.com/0u2ZtNJ.png",
    "https://i.imgur.com/VStOTCZ.png",
    "https://i.imgur.com/pDRtHvO.png",
    "https://i.imgur.com/AkWndvc.png",
    "https://i.imgur.com/Cfa2xdt.png",
    "https://i.imgur.com/sMTSwiG.png",
    "https://i.imgur.com/u8R1Arz.png",
    "https://i.imgur.com/2xypAeW.png",
    "https://i.imgur.com/xzQi9tn.png",
    "https://i.imgur.com/4qHA9BV.png",
    "https://i.imgur.com/z8p3fGH.png",
    "https://i.imgur.com/8DdHXoN.png"
)

# Criar pasta para imagens do Cloudflare
$cloudflareFolder = "public\assets\cloudflare"
if (!(Test-Path $cloudflareFolder)) {
    New-Item -ItemType Directory -Name $cloudflareFolder -Force
    Write-Host "Criada pasta: $cloudflareFolder" -ForegroundColor Yellow
}

$successCount = 0
$totalCount = $cloudflareImages.Count

foreach ($url in $cloudflareImages) {
    try {
        $fileName = $url.Split('/')[-1]
        $outputPath = Join-Path $cloudflareFolder $fileName
        
        Write-Host "Baixando: $fileName" -ForegroundColor Blue
        
        Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing
        
        if (Test-Path $outputPath) {
            $fileSize = (Get-Item $outputPath).Length
            $sizeKB = [math]::Round($fileSize/1KB, 2)
            Write-Host "OK: $fileName ($sizeKB KB)" -ForegroundColor Green
            $successCount++
        }
    }
    catch {
        Write-Host "Falha: $fileName" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "Baixadas: $successCount/$totalCount" -ForegroundColor White
Write-Host "Pasta: $cloudflareFolder" -ForegroundColor Yellow
