# Script para remover console.logs do projeto
Write-Host "Iniciando limpeza de console.logs..." -ForegroundColor Yellow

# Lista de arquivos para processar (excluindo node_modules e dist)
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts", "*.js", "*.jsx" | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*dist*" }

$totalFiles = 0
$processedFiles = 0
$removedLogs = 0

foreach ($file in $files) {
    $totalFiles++
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove console.log statements (keeping console.error and console.warn)
    $content = $content -replace '^\s*console\.log\([^)]*\);\s*$', ''
    $content = $content -replace '^\s*console\.log\([^)]*\);\s*', ''
    $content = $content -replace '\s*console\.log\([^)]*\);\s*', ''
    
    # Count removed logs
    $originalLogs = ($originalContent | Select-String 'console\.log' -AllMatches).Matches.Count
    $newLogs = ($content | Select-String 'console\.log' -AllMatches).Matches.Count
    $removedInFile = $originalLogs - $newLogs
    
    if ($removedInFile -gt 0) {
        Set-Content -Path $file.FullName -Value $content
        $processedFiles++
        $removedLogs += $removedInFile
        Write-Host "$($file.Name): Removidos $removedInFile console.logs" -ForegroundColor Green
    }
}

Write-Host "`nResumo da limpeza:" -ForegroundColor Cyan
Write-Host "   Arquivos processados: $processedFiles de $totalFiles" -ForegroundColor White
Write-Host "   Total de console.logs removidos: $removedLogs" -ForegroundColor White
Write-Host "`nLimpeza concluida!" -ForegroundColor Green
