Write-Host "Criando conta habbohub manualmente..." -ForegroundColor Green

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

# Gerar UUID fictício para o supabase_user_id
$ficticiousUserId = [System.Guid]::NewGuid().ToString()
Write-Host "2. UUID fictício gerado: $ficticiousUserId" -ForegroundColor Cyan

# Criar conta diretamente na tabela habbo_accounts
Write-Host "3. Criando conta na tabela habbo_accounts..." -ForegroundColor Cyan
$accountBody = @{
    habbo_id = "hhbr-habbohub-system"
    habbo_name = "habbohub"
    supabase_user_id = $ficticiousUserId
    hotel = "br"
    is_admin = $true
    figure_string = "hd-180-1.ch-255-66.lg-285-80.sh-290-62.ha-1012-110.hr-831-49"
    motto = "Sistema HabboHub - Administrador"
} | ConvertTo-Json -Depth 3

try {
    $accountResponse = Invoke-RestMethod -Uri "https://wueccgeizznjmjgmuscy.supabase.co/rest/v1/habbo_accounts" -Method Post -Headers $headers -Body $accountBody
    Write-Host "Conta habbohub criada com sucesso!" -ForegroundColor Green
    Write-Host "Account: $($accountResponse)" -ForegroundColor White
} catch {
    Write-Host "Erro ao criar conta: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Resposta: $responseBody" -ForegroundColor Red
    }
}
