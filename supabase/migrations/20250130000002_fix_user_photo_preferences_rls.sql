-- ========================================
-- FIX USER_PHOTO_PREFERENCES RLS
-- ========================================
-- Ajusta as políticas RLS para não depender de auth.uid()
-- já que o sistema não usa Supabase Auth

-- Remover políticas antigas que dependem de auth.uid()
DROP POLICY IF EXISTS "Users can view their own photo preferences" ON user_photo_preferences;
DROP POLICY IF EXISTS "Users can insert their own photo preferences" ON user_photo_preferences;
DROP POLICY IF EXISTS "Users can update their own photo preferences" ON user_photo_preferences;
DROP POLICY IF EXISTS "Users can delete their own photo preferences" ON user_photo_preferences;

-- Desabilitar RLS temporariamente para permitir acesso via client
-- (O controle de acesso será feito via aplicação)
ALTER TABLE user_photo_preferences DISABLE ROW LEVEL SECURITY;

-- Comentário explicativo
COMMENT ON TABLE user_photo_preferences IS 'Armazena as preferências de visibilidade de fotos dos usuários. RLS desabilitado - controle de acesso via aplicação.';
