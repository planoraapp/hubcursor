# Script para forçar reload do servidor
Write-Host "�� Forçando reload do servidor..." -ForegroundColor Cyan

# Parar processos na porta 8080
Write-Host "⏹️ Parando processos na porta 8080..." -ForegroundColor Yellow
netstat -ano | findstr :8080 | ForEach-Object {
    $pid = ($_ -split '\s+')[-1]
    if ($pid -and $pid -ne "0") {
        Write-Host "Matando processo $pid" -ForegroundColor Red
        taskkill /F /PID $pid
    }
}

# Aguardar um pouco
Start-Sleep -Seconds 2

# Iniciar o servidor novamente
Write-Host "�� Iniciando servidor..." -ForegroundColor Green
Set-Location "hubcursor"
npm run dev
