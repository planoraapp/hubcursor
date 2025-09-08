# Script de configuração do monitoramento de badges
# Não requer privilégios de administrador

Write-Host "🔧 Configurando Monitoramento Automático de Badges" -ForegroundColor Green
Write-Host ""

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Criar script de execução diária
$scriptContent = @"
@echo off
cd /d "$PWD"
node scripts/check-new-badges-api.cjs
"@

$batchFile = "executar-verificacao-badges.bat"
$scriptContent | Out-File -FilePath $batchFile -Encoding ASCII

Write-Host "✅ Script de execução criado: $batchFile" -ForegroundColor Green

# Criar arquivo de configuração do Windows Task Scheduler
$taskXml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Verifica diariamente novos badges do Habbo Hotel</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2024-01-01T02:00:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>$env:USERNAME</UserId>
      <LogonType>InteractiveToken</LogonType>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions>
    <Exec>
      <Command>$PWD\$batchFile</Command>
      <WorkingDirectory>$PWD</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
"@

$taskXml | Out-File -FilePath "HabboHub-BadgeCheck.xml" -Encoding UTF8

Write-Host "✅ Arquivo de configuração da tarefa criado: HabboHub-BadgeCheck.xml" -ForegroundColor Green

# Instruções para o usuário
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Abra o Agendador de Tarefas do Windows (taskschd.msc)" -ForegroundColor White
Write-Host "2. Clique em 'Importar Tarefa...'" -ForegroundColor White
Write-Host "3. Selecione o arquivo 'HabboHub-BadgeCheck.xml'" -ForegroundColor White
Write-Host "4. A tarefa será executada diariamente às 02:00" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Para testar agora:" -ForegroundColor Cyan
Write-Host "   .\executar-verificacao-badges.bat" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para verificar logs:" -ForegroundColor Cyan
Write-Host "   Get-Content badge-update.log -Tail 10" -ForegroundColor White
