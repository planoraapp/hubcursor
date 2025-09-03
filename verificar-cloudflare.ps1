# Script para verificar imagens do Cloudflare R2
Write-Host "Verificando imagens do Cloudflare R2..." -ForegroundColor Green

# URLs encontradas no site
$testUrls = @(
    "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/de84c967-0daa-4cb3-93e4-3ac057cc2e46/id-preview-76e8ace6--46846548-2217-4eb3-8642-0e834c98ce0c.lovable.app-1756383541442.png",
    "https://habbo-hub.com/favicon.ico",
    "https://habbo-hub.com/assets/index-D2eIhHDz.js",
    "https://habbo-hub.com/assets/index-BI6foRjh.css"
)

$accessibleFiles = @()

foreach ($url in $testUrls) {
    try {
        $fileName = $url.Split('/')[-1]
        Write-Host "Testando: $fileName" -ForegroundColor Blue
        
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            $fileSize = $response.Content.Length
            $sizeKB = [math]::Round($fileSize/1KB, 2)
            Write-Host "OK: $fileName ($sizeKB KB)" -ForegroundColor Green
            $accessibleFiles += $url
        } else {
            Write-Host "Erro: $fileName (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    }
    catch {
        $fileName = $url.Split('/')[-1]
        Write-Host "Falha: $fileName" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "Arquivos acessiveis: $($accessibleFiles.Count)" -ForegroundColor White

# Tentar acessar o JavaScript principal para extrair mais URLs
try {
    $jsUrl = "https://habbo-hub.com/assets/index-D2eIhHDz.js"
    Write-Host "Analisando JavaScript principal..." -ForegroundColor Yellow
    
    $jsResponse = Invoke-WebRequest -Uri $jsUrl -UseBasicParsing
    if ($jsResponse.StatusCode -eq 200) {
        $jsContent = $jsResponse.Content
        
        # Salvar JavaScript para analise
        $jsContent | Out-File -FilePath "site-javascript.js" -Encoding UTF8
        Write-Host "JavaScript salvo em: site-javascript.js" -ForegroundColor Yellow
        
        # Procurar por URLs de imagens
        $imagePattern = 'https?://[^"\s]+\.(?:png|jpg|jpeg|gif|ico|svg)'
        $imageMatches = [regex]::Matches($jsContent, $imagePattern)
        
        Write-Host "URLs de imagens encontradas no JavaScript:" -ForegroundColor Green
        foreach ($match in $imageMatches) {
            Write-Host "  $($match.Value)" -ForegroundColor White
        }
    }
}
catch {
    Write-Host "Falha ao analisar JavaScript: $($_.Exception.Message)" -ForegroundColor Red
}
