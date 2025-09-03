# Script simples para verificar o Supabase
Write-Host "Verificando bucket do Supabase..." -ForegroundColor Green

# Testar URLs diretas
$testUrls = @(
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/logo.png",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/habbohub-logo.png",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/icons/home.png",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/backgrounds/main-bg.png"
)

$accessibleImages = @()

foreach ($url in $testUrls) {
    try {
        $imgName = $url.Split('/')[-1]
        Write-Host "Testando: $imgName" -ForegroundColor Blue
        
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            $fileSize = $response.Content.Length
            $sizeKB = [math]::Round($fileSize/1KB, 2)
            Write-Host "OK: $imgName ($sizeKB KB)" -ForegroundColor Green
            $accessibleImages += $url
        } else {
            Write-Host "Erro: $imgName (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    }
    catch {
        $imgName = $url.Split('/')[-1]
        Write-Host "Falha: $imgName" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "Imagens acessiveis: $($accessibleImages.Count)" -ForegroundColor White

if ($accessibleImages.Count -gt 0) {
    $accessibleImages | Out-File -FilePath "imagens-ok.txt" -Encoding UTF8
    Write-Host "URLs salvas em: imagens-ok.txt" -ForegroundColor Yellow
}
