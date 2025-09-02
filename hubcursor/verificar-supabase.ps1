# Script para verificar a estrutura do bucket do Supabase
# Este script analisa o bucket para encontrar as imagens corretas

Write-Host "🔍 Verificando estrutura do bucket do Supabase..." -ForegroundColor Green
Write-Host "☁️  Bucket: wueccgeizznjmjgmuscy" -ForegroundColor Yellow
Write-Host ""

# URLs para verificar a estrutura do bucket
$bucketUrls = @(
    # Estrutura principal
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/list/assets",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/list/images",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/list/public",
    
    # Subpastas comuns
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/list/assets/icons",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/list/assets/backgrounds",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/list/assets/ui",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/list/assets/habbo"
)

# Função para verificar URL
function Test-BucketUrl {
    param($url, $description)
    
    try {
        Write-Host "🔍 Verificando: $description" -ForegroundColor Blue
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Acessível: $description" -ForegroundColor Green
            Write-Host "   📄 Conteúdo: $($response.Content.Length) bytes" -ForegroundColor Cyan
            
            # Tentar extrair informações do conteúdo
            if ($response.Content -match '"name"') {
                Write-Host "   📁 Contém arquivos" -ForegroundColor Green
            }
            
            return $true
        } else {
            Write-Host "❌ Erro: $description (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Falha: $description - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Verificar URLs do bucket
Write-Host "🚀 Testando acesso ao bucket..." -ForegroundColor Green
Write-Host ""

$accessibleUrls = @()
foreach ($url in $bucketUrls) {
    $description = $url.Split('/')[-1]
    if (Test-BucketUrl -url $url -description $description) {
        $accessibleUrls += $url
    }
    Write-Host ""
}

# Tentar acessar diretamente algumas imagens conhecidas
Write-Host "🖼️  Testando acesso direto a imagens..." -ForegroundColor Yellow
Write-Host ""

$testImages = @(
    # Logos
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/logo.png",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/habbohub-logo.png",
    "https://wueccgeizznmjgmuscy.supabase.co/storage/v1/object/public/assets/hub-icon.png",
    
    # Ícones
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/icons/home.png",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/icons/console.png",
    
    # Backgrounds
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/backgrounds/main-bg.png",
    "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/assets/backgrounds/console-bg.png"
)

$accessibleImages = @()
foreach ($imgUrl in $testImages) {
    try {
        $imgName = $imgUrl.Split('/')[-1]
        Write-Host "🖼️  Testando: $imgName" -ForegroundColor Blue
        
        $response = Invoke-WebRequest -Uri $imgUrl -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            $fileSize = $response.Content.Length
            Write-Host "✅ Acessível: $imgName ($([math]::Round($fileSize/1KB, 2)) KB)" -ForegroundColor Green
            $accessibleImages += $imgUrl
        } else {
            Write-Host "❌ Erro: $imgName (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    }
    catch {
        $imgName = $imgUrl.Split('/')[-1]
        Write-Host "❌ Falha: $imgName - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Salvar resultados
Write-Host ""
Write-Host "📊 Resumo da verificação:" -ForegroundColor Cyan
Write-Host "   URLs do bucket acessíveis: $($accessibleUrls.Count)" -ForegroundColor White
Write-Host "   Imagens acessíveis: $($accessibleImages.Count)" -ForegroundColor White

# Salvar URLs acessíveis
if ($accessibleImages.Count -gt 0) {
    $accessibleImages | Out-File -FilePath "imagens-supabase-acessiveis.txt" -Encoding UTF8
    Write-Host "💾 URLs acessíveis salvas em: imagens-supabase-acessiveis.txt" -ForegroundColor Yellow
}

# Próximos passos
Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique os arquivos gerados" -ForegroundColor White
Write-Host "2. Execute 'baixar-supabase.ps1' para baixar as imagens" -ForegroundColor White
Write-Host "3. Atualize o site com as imagens corretas" -ForegroundColor White

if ($accessibleImages.Count -eq 0) {
    Write-Host ""
    Write-Host "⚠️  Nenhuma imagem foi encontrada no bucket!" -ForegroundColor Red
    Write-Host "💡 Verifique:" -ForegroundColor Yellow
    Write-Host "   - Se o bucket está público" -ForegroundColor White
    Write-Host "   - Se as URLs estão corretas" -ForegroundColor White
    Write-Host "   - Se há permissões de acesso" -ForegroundColor White
}
