# Script para deploy do Supabase
Write-Host "🚀 Deploy do Supabase para HabboHub" -ForegroundColor Green
Write-Host ""

# Verificar se estamos na pasta correta
if (!(Test-Path "supabase\functions\habbo-auth\index.ts")) {
    Write-Host "❌ Erro: Arquivo da Edge Function não encontrado!" -ForegroundColor Red
    Write-Host "Execute este script na pasta raiz do projeto (habbo-hub)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Estrutura de pastas verificada" -ForegroundColor Green
Write-Host ""

# Mostrar instruções
Write-Host "📋 INSTRUÇÕES PARA DEPLOY:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣ Acesse o Dashboard do Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣ Execute a migração SQL:" -ForegroundColor White
Write-Host "   - Vá em SQL Editor" -ForegroundColor Yellow
Write-Host "   - Cole o conteúdo de: supabase\migrations\20240925_create_users_table.sql" -ForegroundColor Yellow
Write-Host "   - Execute o comando" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣ Deploy da Edge Function:" -ForegroundColor White
Write-Host "   - Vá em Edge Functions" -ForegroundColor Yellow
Write-Host "   - Clique em 'New Function'" -ForegroundColor Yellow
Write-Host "   - Nome: habbo-auth" -ForegroundColor Yellow
Write-Host "   - Cole o código de: supabase\functions\habbo-auth\index.ts" -ForegroundColor Yellow
Write-Host "   - Deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣ Configure variáveis de ambiente:" -ForegroundColor White
Write-Host "   - Na Edge Function, vá em Settings" -ForegroundColor Yellow
Write-Host "   - Adicione:" -ForegroundColor Yellow
Write-Host "     SUPABASE_URL=https://wueccgeizznjmjgmuscy.supabase.co" -ForegroundColor Yellow
Write-Host "     SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui" -ForegroundColor Yellow
Write-Host ""
Write-Host "5️⃣ Teste a função:" -ForegroundColor White
Write-Host "   - Abra: teste-supabase-login.html" -ForegroundColor Yellow
Write-Host "   - Use username: habbohub, motto: HUB-HA2VEA" -ForegroundColor Yellow
Write-Host ""

# Verificar se o Supabase CLI está instalado
try {
    $supabaseVersion = supabase --version 2>$null
    if ($supabaseVersion) {
        Write-Host "✅ Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Para deploy via CLI, execute:" -ForegroundColor Cyan
        Write-Host "   supabase functions deploy habbo-auth" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host "ℹ️ Supabase CLI não encontrado" -ForegroundColor Yellow
    Write-Host "   Use o dashboard web para deploy" -ForegroundColor White
}

Write-Host "📁 Arquivos criados:" -ForegroundColor Cyan
Write-Host "   ✅ supabase\functions\habbo-auth\index.ts" -ForegroundColor Green
Write-Host "   ✅ supabase\migrations\20240925_create_users_table.sql" -ForegroundColor Green
Write-Host "   ✅ teste-supabase-login.html (atualizado)" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximo passo: Configure o Supabase seguindo as instruções acima!" -ForegroundColor Green
