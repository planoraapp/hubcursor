Write-Host "Criando conta habbohub completa (auth + habbo_accounts)..." -ForegroundColor Green

$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc"
    "Content-Type" = "application/json"
}

# Primeiro, verificar se já existe
Write-Host "1. Verificando se conta já existe..." -ForegroundColor Cyan
try {
    $checkResponse = Invoke-RestMethod -Uri "https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts?habbo_name=ilike.habbohub" -Headers $headers
    if ($checkResponse.Count -gt 0) {
        Write-Host "Conta habbohub já existe!" -ForegroundColor Yellow
        $checkResponse | ForEach-Object { Write-Host "ID: $($_.id), Nome: $($_.habbo_name), Hotel: $($_.hotel)" -ForegroundColor White }
        exit
    }
} catch {
    Write-Host "Erro ao verificar conta existente: $($_.Exception.Message)" -ForegroundColor Red
}

# Gerar UUID fixo para habbohub
$habbohubUserId = "hhbr-habbohub-user-id-12345"
Write-Host "2. UUID fixo para habbohub: $habbohubUserId" -ForegroundColor Cyan

# Tentar criar usuário auth diretamente na tabela auth.users (usando admin API)
Write-Host "3. Tentando criar usuário auth via API admin..." -ForegroundColor Cyan

# Como não temos acesso direto à API admin, vamos usar a função register-or-reset-via-motto
Write-Host "4. Usando função register-or-reset-via-motto..." -ForegroundColor Cyan

$registerBody = @{
    habbo_name = "habbohub"
    hotel = "br"
    verification_code = "HUB-12345"
} | ConvertTo-Json -Depth 3

try {
    $registerResponse = Invoke-RestMethod -Uri "https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/register-or-reset-via-motto" -Method Post -Headers $headers -Body $registerBody
    Write-Host "Resposta da função register: $registerResponse" -ForegroundColor Green
} catch {
    Write-Host "Erro ao usar função register: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Resposta: $responseBody" -ForegroundColor Red
    }
}
