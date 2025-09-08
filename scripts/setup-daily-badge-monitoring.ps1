# Script para configurar monitoramento diário de badges
# Cria uma tarefa agendada no Windows para verificar novos badges

param(
    [string]$ScriptPath = "C:\Users\matheus.roque\Pictures\HabboHub\flash-assets-PRODUCTION-202508202352-144965391\scripts\daily-badge-checker.cjs",
    [string]$TaskName = "HabboHub-BadgeChecker",
    [string]$Time = "09:00"
)

Write-Host "🚀 Configurando monitoramento diário de badges..." -ForegroundColor Green

# Verificar se o script existe
if (-not (Test-Path $ScriptPath)) {
    Write-Host "❌ Script não encontrado: $ScriptPath" -ForegroundColor Red
    exit 1
}

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Criar diretório de logs se não existir
$logDir = Join-Path (Split-Path $ScriptPath -Parent) "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    Write-Host "📁 Diretório de logs criado: $logDir" -ForegroundColor Yellow
}

# Criar arquivo de configuração
$configFile = Join-Path (Split-Path $ScriptPath -Parent) "badge-monitor-config.json"
$config = @{
    scriptPath = $ScriptPath
    logFile = Join-Path $logDir "badge-updates.log"
    reportFile = Join-Path $logDir "daily-report.json"
    scheduleTime = $Time
    lastRun = $null
    enabled = $true
} | ConvertTo-Json -Depth 3

Set-Content -Path $configFile -Value $config
Write-Host "⚙️ Arquivo de configuração criado: $configFile" -ForegroundColor Yellow

# Criar script batch para execução
$batchFile = Join-Path (Split-Path $ScriptPath -Parent) "run-badge-checker.bat"
$batchContent = @"
@echo off
cd /d "$(Split-Path $ScriptPath -Parent)"
echo [%date% %time%] Iniciando verificação de badges...
node daily-badge-checker.cjs
echo [%date% %time%] Verificação concluída.
"@

Set-Content -Path $batchFile -Value $batchContent
Write-Host "📝 Script batch criado: $batchFile" -ForegroundColor Yellow

# Criar tarefa agendada
try {
    # Remover tarefa existente se houver
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "🗑️ Tarefa existente removida" -ForegroundColor Yellow
    }
    
    # Criar nova tarefa
    $action = New-ScheduledTaskAction -Execute $batchFile
    $trigger = New-ScheduledTaskTrigger -Daily -At $Time
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType InteractiveToken
    
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Verificação diária de novos badges do Habbo Hotel"
    
    Write-Host "✅ Tarefa agendada criada com sucesso!" -ForegroundColor Green
    Write-Host "   Nome: $TaskName" -ForegroundColor Cyan
    Write-Host "   Horário: $Time (diariamente)" -ForegroundColor Cyan
    Write-Host "   Script: $ScriptPath" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro ao criar tarefa agendada: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Tente executar como administrador ou configure manualmente no Agendador de Tarefas" -ForegroundColor Yellow
}

# Criar script de teste
$testFile = Join-Path (Split-Path $ScriptPath -Parent) "test-badge-checker.ps1"
$testContent = @"
# Script de teste para verificação de badges
Write-Host "🧪 Testando verificação de badges..." -ForegroundColor Yellow

# Executar verificação
& "$ScriptPath"

# Mostrar relatório se existir
`$reportFile = Join-Path (Split-Path `$ScriptPath -Parent) "logs\daily-report.json"
if (Test-Path `$reportFile) {
    `$report = Get-Content `$reportFile | ConvertFrom-Json
    Write-Host "📊 Relatório da última verificação:" -ForegroundColor Green
    Write-Host "   Novos badges: `$(`$report.newBadges)" -ForegroundColor Cyan
    Write-Host "   Badges atualizados: `$(`$report.updatedBadges)" -ForegroundColor Cyan
    Write-Host "   Total na API: `$(`$report.totalApi)" -ForegroundColor Cyan
    Write-Host "   Total no banco: `$(`$report.totalDb)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Nenhum relatório encontrado" -ForegroundColor Red
}
"@

Set-Content -Path $testFile -Value $testContent
Write-Host "🧪 Script de teste criado: $testFile" -ForegroundColor Yellow

Write-Host "`n🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "2. Execute: .\test-badge-checker.ps1 (para testar)" -ForegroundColor White
Write-Host "3. Verifique o Agendador de Tarefas para confirmar a tarefa" -ForegroundColor White
Write-Host "4. Monitore os logs em: $logDir" -ForegroundColor White

Write-Host "`n🔧 Comandos úteis:" -ForegroundColor Yellow
Write-Host "   Testar: .\test-badge-checker.ps1" -ForegroundColor White
Write-Host "   Executar: .\run-badge-checker.bat" -ForegroundColor White
Write-Host "   Ver logs: Get-Content $logDir\badge-updates.log -Tail 20" -ForegroundColor White
