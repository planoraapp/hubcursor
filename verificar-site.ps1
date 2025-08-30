# Script para verificar o site habbo-hub.com e identificar imagens
# Este script analisa o site para encontrar as imagens corretas

Write-Host "🔍 Analisando o site habbo-hub.com..." -ForegroundColor Green
Write-Host ""

try {
    # Tentar acessar o site principal
    Write-Host "📡 Conectando ao habbo-hub.com..." -ForegroundColor Blue
    $response = Invoke-WebRequest -Uri "https://habbo-hub.com" -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site acessível!" -ForegroundColor Green
        Write-Host "📄 Tamanho da página: $([math]::Round($response.Content.Length/1KB, 2)) KB" -ForegroundColor Cyan
        
        # Extrair URLs de imagens
        $imagePattern = 'src=["\']([^"\']*\.(?:png|jpg|jpeg|gif|ico|svg))["\']'
        $imageMatches = [regex]::Matches($response.Content, $imagePattern)
        
        Write-Host ""
        Write-Host "🖼️  Imagens encontradas no site:" -ForegroundColor Yellow
        
        $uniqueImages = @()
        foreach ($match in $imageMatches) {
            $imageUrl = $match.Groups[1].Value
            if ($imageUrl -notin $uniqueImages) {
                $uniqueImages += $imageUrl
                Write-Host "   📷 $imageUrl" -ForegroundColor White
            }
        }
        
        Write-Host ""
        Write-Host "📊 Total de imagens únicas: $($uniqueImages.Count)" -ForegroundColor Green
        
        # Salvar lista de imagens encontradas
        $imagesList = $uniqueImages | ForEach-Object { "https://habbo-hub.com$_" }
        $imagesList | Out-File -FilePath "imagens-encontradas.txt" -Encoding UTF8
        
        Write-Host "💾 Lista salva em: imagens-encontradas.txt" -ForegroundColor Yellow
        
    } else {
        Write-Host "❌ Erro ao acessar o site. Status: $($response.StatusCode)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Erro ao conectar ao site: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Tentando método alternativo..." -ForegroundColor Yellow
    
    # Tentar acessar diretamente algumas imagens comuns
    $commonImages = @(
        "/assets/logo.png",
        "/assets/favicon.ico",
        "/images/logo.png",
        "/img/logo.png",
        "/static/logo.png"
    )
    
    Write-Host "🔍 Verificando imagens comuns..." -ForegroundColor Blue
    
    foreach ($img in $commonImages) {
        try {
            $imgUrl = "https://habbo-hub.com$img"
            $imgResponse = Invoke-WebRequest -Uri $imgUrl -UseBasicParsing -TimeoutSec 5
            
            if ($imgResponse.StatusCode -eq 200) {
                Write-Host "✅ Encontrada: $img" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "❌ Não encontrada: $img" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique o arquivo 'imagens-encontradas.txt'" -ForegroundColor White
Write-Host "2. Execute o script 'baixar-imagens.ps1' para baixar as imagens" -ForegroundColor White
Write-Host "3. Atualize o site com as imagens corretas" -ForegroundColor White
