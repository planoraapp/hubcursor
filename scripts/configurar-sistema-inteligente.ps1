# Script de configuração do sistema inteligente de badges
# Usa datas de criação para determinar badges realmente novos

Write-Host "🧠 Configurando Sistema Inteligente de Badges" -ForegroundColor Green
Write-Host ""

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Executar configuração inicial
Write-Host "🔧 Executando configuração inicial..." -ForegroundColor Yellow
node scripts/setup-badge-monitoring.cjs

# Executar primeira sincronização completa
Write-Host "📥 Executando primeira sincronização completa..." -ForegroundColor Yellow
node scripts/smart-badge-update.cjs

# Criar script de execução semanal
$scriptContent = @"
@echo off
cd /d "$PWD"
echo [%date% %time%] Executando verificação inteligente de badges...
node scripts/smart-badge-update.cjs
echo [%date% %time%] Verificação concluída.
"@

$batchFile = "verificacao-inteligente-badges.bat"
$scriptContent | Out-File -FilePath $batchFile -Encoding ASCII

Write-Host "✅ Script de verificação inteligente criado: $batchFile" -ForegroundColor Green

# Criar arquivo de configuração do Windows Task Scheduler (semanal)
$taskXml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Verifica semanalmente novos badges do Habbo Hotel usando sistema inteligente</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2024-01-01T02:00:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByWeek>
        <WeeksInterval>1</WeeksInterval>
        <DaysOfWeek>
          <Monday />
        </DaysOfWeek>
      </ScheduleByWeek>
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
    <ExecutionTimeLimit>PT2H</ExecutionTimeLimit>
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

$taskXml | Out-File -FilePath "HabboHub-SmartBadgeCheck.xml" -Encoding UTF8

Write-Host "✅ Arquivo de configuração da tarefa criado: HabboHub-SmartBadgeCheck.xml" -ForegroundColor Green

# Verificar arquivos criados
Write-Host ""
Write-Host "📊 Verificando arquivos criados:" -ForegroundColor Cyan

$files = @(
    "src/data/badge-codes.json",
    "src/data/badge-categories.json", 
    "src/data/full-badge-info.json",
    "badge-update.log"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "✅ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - FALTANDO" -ForegroundColor Red
    }
}

# Instruções para o usuário
Write-Host ""
Write-Host "🎉 Sistema Inteligente Configurado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Como funciona:" -ForegroundColor Yellow
Write-Host "• O sistema usa as datas de criação dos badges da API" -ForegroundColor White
Write-Host "• Só adiciona badges realmente novos (criados após a última verificação)" -ForegroundColor White
Write-Host "• Verificação semanal (segundas-feiras às 02:00)" -ForegroundColor White
Write-Host "• Ordenação automática por data de criação (mais recentes primeiro)" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Abra o Agendador de Tarefas do Windows (taskschd.msc)" -ForegroundColor White
Write-Host "2. Clique em 'Importar Tarefa...'" -ForegroundColor White
Write-Host "3. Selecione o arquivo 'HabboHub-SmartBadgeCheck.xml'" -ForegroundColor White
Write-Host "4. A tarefa será executada semanalmente" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Para testar agora:" -ForegroundColor Cyan
Write-Host "   .\verificacao-inteligente-badges.bat" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para verificar logs:" -ForegroundColor Cyan
Write-Host "   Get-Content badge-update.log -Tail 10" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Para forçar verificação:" -ForegroundColor Cyan
Write-Host "   node scripts/smart-badge-update.cjs" -ForegroundColor White
