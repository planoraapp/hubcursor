# ========================================
# SCRIPT DE LIMPEZA DE ARQUIVOS OBSOLETOS
# Remove scripts, hooks e docs obsoletos do projeto
# ========================================

Write-Host "🧹 LIMPEZA DE ARQUIVOS OBSOLETOS - HABBOHUB" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Mudar para o diretório raiz do projeto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "📂 Diretório do projeto: $projectRoot`n" -ForegroundColor Yellow

# ========================================
# LISTA DE ARQUIVOS PARA DELETAR
# ========================================

$arquivosParaDeletar = @(
    # Scripts de limpeza temporários (já usados)
    "scripts\cleanup-database.cjs",
    "scripts\cleanup-database.sql",
    "scripts\cleanup-habbohub-database.sql",
    "scripts\cleanup-obsolete-functions.sql",
    "scripts\execute-cleanup-NOW.sql",
    "scripts\verify-cleanup-status.sql",
    "scripts\COMO-EXECUTAR-LIMPEZA-HABBOHUB.md",
    "scripts\README-cleanup.md",
    
    # Scripts de verificação obsoletos
    "scripts\verify-cleanup.cjs",
    "scripts\check-beebop-duplicates.mjs",
    "scripts\check-beebop-simple.mjs",
    "scripts\fix-beebop-duplicates.sql",
    "scripts\clean-console-logs.cjs",
    
    # Scripts de backup e consolidação obsoletos
    "scripts\backup-supabase-functions.cjs",
    "scripts\cleanup-supabase-functions.cjs",
    "scripts\remove-supabase-functions.cjs",
    "scripts\consolidate-apis.cjs",
    "scripts\centralize-interfaces.cjs",
    
    # Edge Functions one-time (já executadas)
    "supabase\functions\create-photo-comments-table",
    "supabase\functions\fix-photo-comments-constraint",
    "supabase\functions\get_auth_email_for_habbo",
    
    # Hooks obsoletos (não utilizados)
    "src\hooks\useViaJovemData.tsx",
    "src\hooks\useViaJovemComplete.tsx",
    "src\hooks\useTemplariosData.tsx",
    "src\hooks\useTemplariosFigure.tsx",
    "src\hooks\useTemplariosPreview.tsx",
    "src\hooks\useHybridClothingData.tsx",
    
    # Documentação/Auditoria obsoleta
    "AUDITORIA_CORRECOES_APLICADAS.md",
    "AUDITORIA_FINAL.md",
    "DOCUMENTACAO_CONSOLIDADA.md",
    "ENVIRONMENT_SETUP.md",
    "PRE_DEPLOY_CHECKLIST.md",
    "GAME_OPTIMIZATION_GUIDE.md",
    "QUICK_GUIDE_KEEP_ALIVE.md",
    "QUICK_START.md",
    
    # Docs obsoletos
    "docs\BACKGROUND_SYNC_FIX.md",
    "docs\plans\editor-recovery.md"
)

# ========================================
# VERIFICAR QUAIS ARQUIVOS EXISTEM
# ========================================

$arquivosExistentes = @()
$arquivosNaoEncontrados = @()
$totalSize = 0

Write-Host "🔍 Verificando arquivos..." -ForegroundColor Yellow

foreach ($arquivo in $arquivosParaDeletar) {
    $caminhoCompleto = Join-Path $projectRoot $arquivo
    
    if (Test-Path $caminhoCompleto) {
        $item = Get-Item $caminhoCompleto
        if ($item.PSIsContainer) {
            $size = (Get-ChildItem $caminhoCompleto -Recurse | Measure-Object -Property Length -Sum).Sum
        } else {
            $size = $item.Length
        }
        $totalSize += $size
        $arquivosExistentes += [PSCustomObject]@{
            Caminho = $arquivo
            Tamanho = $size
            TamanhoFormatado = "{0:N2} KB" -f ($size / 1KB)
        }
    } else {
        $arquivosNaoEncontrados += $arquivo
    }
}

# ========================================
# MOSTRAR RESULTADO DA VERIFICAÇÃO
# ========================================

Write-Host "`n📊 RESULTADO DA VERIFICAÇÃO:" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "✅ Arquivos encontrados: $($arquivosExistentes.Count)" -ForegroundColor Green
Write-Host "❌ Arquivos já deletados: $($arquivosNaoEncontrados.Count)" -ForegroundColor Gray
Write-Host "💾 Espaço total a liberar: $("{0:N2} MB" -f ($totalSize / 1MB))`n" -ForegroundColor Yellow

if ($arquivosExistentes.Count -eq 0) {
    Write-Host "✨ Nenhum arquivo obsoleto encontrado! Projeto já está limpo." -ForegroundColor Green
    exit 0
}

# Listar arquivos que serão deletados
Write-Host "📋 ARQUIVOS QUE SERÃO DELETADOS:" -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

foreach ($arquivo in $arquivosExistentes) {
    Write-Host "  • $($arquivo.Caminho)" -ForegroundColor White
    Write-Host "    Tamanho: $($arquivo.TamanhoFormatado)`n" -ForegroundColor Gray
}

# ========================================
# CONFIRMAR DELEÇÃO
# ========================================

Write-Host "`n⚠️  ATENÇÃO: Esta ação não pode ser desfeita!" -ForegroundColor Red
Write-Host "Certifique-se de ter um commit salvo no Git antes de continuar.`n" -ForegroundColor Yellow

$confirmacao = Read-Host "Deseja DELETAR estes $($arquivosExistentes.Count) arquivos? (sim/não)"

if ($confirmacao -ne "sim") {
    Write-Host "`n❌ Operação cancelada pelo usuário." -ForegroundColor Red
    exit 1
}

# ========================================
# DELETAR ARQUIVOS
# ========================================

Write-Host "`n🗑️  Deletando arquivos..." -ForegroundColor Yellow

$deletadosComSucesso = 0
$erros = 0

foreach ($arquivo in $arquivosExistentes) {
    $caminhoCompleto = Join-Path $projectRoot $arquivo.Caminho
    
    try {
        if (Test-Path $caminhoCompleto) {
            Remove-Item -Path $caminhoCompleto -Recurse -Force -ErrorAction Stop
            Write-Host "  ✅ Deletado: $($arquivo.Caminho)" -ForegroundColor Green
            $deletadosComSucesso++
        }
    }
    catch {
        Write-Host "  ❌ Erro ao deletar: $($arquivo.Caminho)" -ForegroundColor Red
        Write-Host "     $($_.Exception.Message)" -ForegroundColor Red
        $erros++
    }
}

# ========================================
# RESULTADO FINAL
# ========================================

Write-Host "`n" -NoNewline
Write-Host "🎉 LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host "=====================`n" -ForegroundColor Green

Write-Host "✅ Arquivos deletados: $deletadosComSucesso" -ForegroundColor Green
Write-Host "❌ Erros: $erros" -ForegroundColor $(if ($erros -gt 0) { "Red" } else { "Gray" })
Write-Host "💾 Espaço liberado: $("{0:N2} MB" -f ($totalSize / 1MB))`n" -ForegroundColor Yellow

if ($erros -eq 0) {
    Write-Host "Todos os arquivos obsoletos foram removidos com sucesso!" -ForegroundColor Green
    Write-Host "`nProximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Testar a aplicacao para garantir que tudo funciona" -ForegroundColor White
    Write-Host "  2. Fazer commit das mudancas" -ForegroundColor White
    Write-Host "  3. Push para o repositorio" -ForegroundColor White
} else {
    Write-Host "Alguns arquivos nao puderam ser deletados. Verifique os erros acima." -ForegroundColor Yellow
}

Write-Host ""

