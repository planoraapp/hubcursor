# Script para baixar assets do GitHub
$assets = @(
    "Calca1.png",
    "Tenis.png", 
    "Bone1.png",
    "Acessorios1.png",
    "oculos1.png",
    "beard.png",
    "Estampa1.png",
    "casaco1.png",
    "colares.png",
    "cinto.png"
)

$baseUrl = "https://raw.githubusercontent.com/planoraapp/hubcursor/main/assets/"
$targetDir = "public/assets"

foreach ($asset in $assets) {
    $url = $baseUrl + $asset
    $output = Join-Path $targetDir $asset
    
    Write-Host "Baixando $asset..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop
        Write-Host "✅ $asset baixado com sucesso"
    }
    catch {
        Write-Host "❌ Erro ao baixar $asset : $($_.Exception.Message)"
    }
}

Write-Host "Download concluído!"
