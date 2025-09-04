# Script para baixar pets do Habbo usando habbo-downloader
Write-Host "🐾 Baixando pets do Habbo..." -ForegroundColor Green

# Verificar se o habbo-downloader está instalado
try {
    $hdlVersion = npm list -g habbo-downloader 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "�� Instalando habbo-downloader..." -ForegroundColor Yellow
        npm install -g habbo-downloader
    } else {
        Write-Host "✅ habbo-downloader já está instalado" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro ao verificar habbo-downloader" -ForegroundColor Red
    exit 1
}

# Criar pasta para os pets
$petsFolder = "public/assets/pets"
if (!(Test-Path $petsFolder)) {
    New-Item -ItemType Directory -Path $petsFolder -Force
    Write-Host "📁 Criada pasta: $petsFolder" -ForegroundColor Yellow
}

# Baixar pets usando habbo-downloader
Write-Host "⬇️ Baixando pets do Habbo..." -ForegroundColor Blue
try {
    # Baixar pets para a pasta específica
    hdl -c pets -o $petsFolder -d com.br
    
    Write-Host "✅ Pets baixados com sucesso!" -ForegroundColor Green
    
    # Listar arquivos baixados
    $downloadedFiles = Get-ChildItem $petsFolder -File
    Write-Host "📋 Arquivos baixados:" -ForegroundColor Cyan
    foreach ($file in $downloadedFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Erro ao baixar pets: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Tentando método alternativo..." -ForegroundColor Yellow
    
    # Método alternativo: baixar manualmente
    $petUrls = @{
        "monkey.png" = "https://habboxwiki.com/images/pets/monkey.png"
        "dog.png" = "https://habboxwiki.com/images/pets/dog.png"
        "cat.png" = "https://habboxwiki.com/images/pets/cat.png"
        "bear.png" = "https://habboxwiki.com/images/pets/bear.png"
        "dragon.png" = "https://habboxwiki.com/images/pets/dragon.png"
    }
    
    foreach ($pet in $petUrls.GetEnumerator()) {
        try {
            $outputPath = Join-Path $petsFolder $pet.Key
            Write-Host "⬇️ Baixando $($pet.Key)..." -ForegroundColor Blue
            Invoke-WebRequest -Uri $pet.Value -OutFile $outputPath -UseBasicParsing
            Write-Host "✅ $($pet.Key) baixado!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao baixar $($pet.Key): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "�� Processo concluído!" -ForegroundColor Green
Write-Host "�� Pets salvos em: $petsFolder" -ForegroundColor Cyan
