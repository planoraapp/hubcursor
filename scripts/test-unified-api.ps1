# Script para testar a API unificada
# Execute este script antes de remover as funções obsoletas

Write-Host "🧪 Testando API unificada..." -ForegroundColor Blue

# Verificar se o Supabase CLI está instalado
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado. Instale primeiro:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Deploy da API unificada
Write-Host "🚀 Fazendo deploy da API unificada..." -ForegroundColor Blue
try {
    supabase functions deploy habbo-unified-api
    Write-Host "✅ API unificada deployada com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no deploy da API unificada: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Testar endpoints da API unificada
Write-Host "🔍 Testando endpoints..." -ForegroundColor Blue

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Endpoint,
        [string]$Action,
        [hashtable]$Params = @{}
    )
    
    Write-Host "  Testing $Endpoint.$Action..." -ForegroundColor Gray
    
    try {
        $body = @{
            endpoint = $Endpoint
            action = $Action
            params = $Params
        } | ConvertTo-Json -Depth 3
        
        $response = supabase functions invoke habbo-unified-api --data $body
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ $Endpoint.$Action - OK" -ForegroundColor Green
            # Log response for debugging if needed
            if ($response) {
                Write-Host "    📝 Response: $($response.Substring(0, [Math]::Min(100, $response.Length)))..." -ForegroundColor Gray
            }
            return $true
        } else {
            Write-Host "    ❌ $Endpoint.$Action - FAILED" -ForegroundColor Red
            if ($response) {
                Write-Host "    📝 Error: $($response.Substring(0, [Math]::Min(200, $response.Length)))..." -ForegroundColor Red
            }
            return $false
        }
    } catch {
        Write-Host "    ❌ $Endpoint.$Action - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Lista de testes
$tests = @(
    @{ Endpoint = "badges"; Action = "search"; Params = @{ limit = 10; search = ""; category = "all" } },
    @{ Endpoint = "clothing"; Action = "search"; Params = @{ limit = 10; category = "all"; gender = "U" } },
    @{ Endpoint = "users"; Action = "search"; Params = @{ query = "test"; hotel = "br"; limit = 5 } },
    @{ Endpoint = "photos"; Action = "discover"; Params = @{ username = "Beebop"; hotel = "br" } },
    @{ Endpoint = "furni"; Action = "search"; Params = @{ searchTerm = ""; limit = 10 } },
    @{ Endpoint = "feed"; Action = "general"; Params = @{ limit = 5 } }
)

$passedTests = 0
$totalTests = $tests.Count

foreach ($test in $tests) {
    if (Test-Endpoint -Endpoint $test.Endpoint -Action $test.Action -Params $test.Params) {
        $passedTests++
    }
}

Write-Host "📊 Resultado dos testes:" -ForegroundColor Blue
Write-Host "- Testes passou: $passedTests/$totalTests" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 Todos os testes passaram! A API unificada está funcionando corretamente." -ForegroundColor Green
    Write-Host "💡 Agora você pode executar o script de limpeza das funções obsoletas." -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Alguns testes falharam. Verifique os logs e corrija os problemas antes de continuar." -ForegroundColor Red
    Write-Host "💡 Não execute o script de limpeza até que todos os testes passem." -ForegroundColor Yellow
}

Write-Host "🔧 Para testar manualmente, use:" -ForegroundColor Blue
Write-Host "supabase functions invoke habbo-unified-api --data '{\"endpoint\":\"badges\",\"action\":\"search\",\"params\":{\"limit\":10}}'" -ForegroundColor Gray
