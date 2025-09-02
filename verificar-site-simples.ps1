# Script simples para verificar o site
Write-Host "Verificando habbo-hub.com..." -ForegroundColor Green

try {
    Write-Host "Conectando ao site..." -ForegroundColor Blue
    $response = Invoke-WebRequest -Uri "https://habbo-hub.com" -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Site acessivel!" -ForegroundColor Green
        Write-Host "Tamanho: $([math]::Round($response.Content.Length/1KB, 2)) KB" -ForegroundColor Cyan
        
        # Salvar HTML para analise
        $response.Content | Out-File -FilePath "site-content.html" -Encoding UTF8
        Write-Host "HTML salvo em: site-content.html" -ForegroundColor Yellow
    } else {
        Write-Host "Erro: Status $($response.StatusCode)" -ForegroundColor Red
    }
}
catch {
    Write-Host "Falha ao conectar: $($_.Exception.Message)" -ForegroundColor Red
}
