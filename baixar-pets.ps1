Write-Host "🐾 Baixando pets do Habbo..." -ForegroundColor Green

# Criar pasta para pets
$petsFolder = "public\assets\pets"
if (!(Test-Path $petsFolder)) {
    New-Item -ItemType Directory -Path $petsFolder -Force | Out-Null
    Write-Host "📁 Pasta criada: $petsFolder" -ForegroundColor Yellow
}

# URLs das imagens dos pets (usando API oficial do Habbo)
$monkeyUrl = "https://www.habbo.com/habbo-imaging/avatarimage?figure=pet-1-0-0-0-0&size=l&direction=2&head_direction=2"
$dogUrl = "https://www.habbo.com/habbo-imaging/avatarimage?figure=pet-2-0-0-0-0&size=l&direction=2&head_direction=2"
$catUrl = "https://www.habbo.com/habbo-imaging/avatarimage?figure=pet-3-0-0-0-0&size=l&direction=2&head_direction=2"
$bearUrl = "https://www.habbo.com/habbo-imaging/avatarimage?figure=pet-4-0-0-0-0&size=l&direction=2&head_direction=2"
$dragonUrl = "https://www.habbo.com/habbo-imaging/avatarimage?figure=pet-6-0-0-0-0&size=l&direction=2&head_direction=2"

# Baixar macaco
Write-Host "⬇️ Baixando monkey.png..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $monkeyUrl -OutFile "$petsFolder\monkey.png" -UseBasicParsing
    Write-Host "✅ monkey.png baixado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao baixar monkey.png: $($_.Exception.Message)" -ForegroundColor Red
}

# Baixar cachorro
Write-Host "⬇️ Baixando dog.png..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $dogUrl -OutFile "$petsFolder\dog.png" -UseBasicParsing
    Write-Host "✅ dog.png baixado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao baixar dog.png: $($_.Exception.Message)" -ForegroundColor Red
}

# Baixar gato
Write-Host "⬇️ Baixando cat.png..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $catUrl -OutFile "$petsFolder\cat.png" -UseBasicParsing
    Write-Host "✅ cat.png baixado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao baixar cat.png: $($_.Exception.Message)" -ForegroundColor Red
}

# Baixar urso
Write-Host "⬇️ Baixando bear.png..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $bearUrl -OutFile "$petsFolder\bear.png" -UseBasicParsing
    Write-Host "✅ bear.png baixado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao baixar bear.png: $($_.Exception.Message)" -ForegroundColor Red
}

# Baixar dragão
Write-Host "⬇️ Baixando dragon.png..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $dragonUrl -OutFile "$petsFolder\dragon.png" -UseBasicParsing
    Write-Host "✅ dragon.png baixado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao baixar dragon.png: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Download concluído!" -ForegroundColor Green
Write-Host "📂 Pets salvos em: $petsFolder" -ForegroundColor Cyan

# Listar arquivos baixados
$downloadedFiles = Get-ChildItem $petsFolder -File -ErrorAction SilentlyContinue
if ($downloadedFiles) {
    Write-Host "📋 Arquivos baixados:" -ForegroundColor Cyan
    foreach ($file in $downloadedFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
}