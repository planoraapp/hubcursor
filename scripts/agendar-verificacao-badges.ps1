# Script para agendar verificação diária de novos badges
# Execute como Administrador para criar a tarefa agendada

param(
    [switch]$CriarTarefa,
    [switch]$RemoverTarefa,
    [switch]$ExecutarAgora
)

$TarefaNome = "HabboHub-VerificacaoBadges"
$ScriptPath = Join-Path $PSScriptRoot "check-new-badges-api.cjs"
$NodePath = "node"

Write-Host "=== HabboHub - Agendador de Verificação de Badges ===" -ForegroundColor Green

if ($CriarTarefa) {
    Write-Host "Criando tarefa agendada..." -ForegroundColor Yellow
    
    try {
        # Criar ação da tarefa
        $Acao = New-ScheduledTaskAction -Execute $NodePath -Argument "`"$ScriptPath`""
        
        # Criar trigger diário às 02:00
        $Trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
        
        # Configurar settings
        $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        
        # Criar principal (executar como usuário atual)
        $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType InteractiveToken
        
        # Registrar tarefa
        Register-ScheduledTask -TaskName $TarefaNome -Action $Acao -Trigger $Trigger -Settings $Settings -Principal $Principal -Description "Verifica diariamente novos badges do Habbo Hotel"
        
        Write-Host "✅ Tarefa criada com sucesso!" -ForegroundColor Green
        Write-Host "   Nome: $TarefaNome" -ForegroundColor Cyan
        Write-Host "   Execução: Diariamente às 02:00" -ForegroundColor Cyan
        Write-Host "   Script: $ScriptPath" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Erro ao criar tarefa: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($RemoverTarefa) {
    Write-Host "Removendo tarefa agendada..." -ForegroundColor Yellow
    
    try {
        Unregister-ScheduledTask -TaskName $TarefaNome -Confirm:$false
        Write-Host "✅ Tarefa removida com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao remover tarefa: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($ExecutarAgora) {
    Write-Host "Executando verificação agora..." -ForegroundColor Yellow
    
    try {
        Push-Location $PSScriptRoot
        & $NodePath $ScriptPath
        Pop-Location
        Write-Host "✅ Verificação executada!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao executar verificação: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if (-not $CriarTarefa -and -not $RemoverTarefa -and -not $ExecutarAgora) {
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\agendar-verificacao-badges.ps1 -CriarTarefa    # Criar tarefa agendada" -ForegroundColor White
    Write-Host "  .\agendar-verificacao-badges.ps1 -RemoverTarefa  # Remover tarefa agendada" -ForegroundColor White
    Write-Host "  .\agendar-verificacao-badges.ps1 -ExecutarAgora  # Executar verificação agora" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemplo para criar e executar:" -ForegroundColor Cyan
    Write-Host "  .\agendar-verificacao-badges.ps1 -CriarTarefa -ExecutarAgora" -ForegroundColor White
}
