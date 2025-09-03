# Script para corrigir o tamanho do avatar de 'm' para 'M'
Write-Host "�� Corrigindo tamanho do avatar de 'm' para 'M'..." -ForegroundColor Cyan

# Ler o arquivo atual
$content = Get-Content "src/components/tools/AvatarEditorWithTemplarios.tsx" -Raw

# 1. Corrigir o tamanho no getItemPreviewUrl
$content = $content -replace "size=m", "size=M"

# 2. Atualizar o comentário para refletir a mudança
$content = $content -replace "// Gerar URL do item com cor específica - Tamanho real \(M\)", "// Gerar URL do item com cor específica - Tamanho M (Medium)"

# Salvar o arquivo corrigido
$content | Set-Content "src/components/tools/AvatarEditorWithTemplarios.tsx" -Encoding UTF8

Write-Host "✅ Tamanho corrigido de 'm' para 'M'!" -ForegroundColor Green
Write-Host "📏 Agora o preview será maior e mais visível" -ForegroundColor Yellow
Write-Host "�� Tanto o grid de itens quanto o avatar principal usam tamanho M" -ForegroundColor Yellow
