-- ========================================
-- MIGRAÇÃO: CORREÇÕES E MELHORIAS NA TABELA HABBO_AUTH
-- ========================================

-- 1. Adicionar campos que podem estar faltando
ALTER TABLE public.habbo_auth 
ADD COLUMN IF NOT EXISTS habbo_figure_string TEXT,
ADD COLUMN IF NOT EXISTS habbo_unique_id TEXT,
ADD COLUMN IF NOT EXISTS hotel VARCHAR(10) DEFAULT 'br',
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- 2. Atualizar comentários das colunas
COMMENT ON COLUMN public.habbo_auth.habbo_figure_string IS 'String da figura do avatar do Habbo';
COMMENT ON COLUMN public.habbo_auth.habbo_unique_id IS 'ID único do usuário no Habbo';
COMMENT ON COLUMN public.habbo_auth.hotel IS 'Hotel do Habbo (br, com, etc.)';
COMMENT ON COLUMN public.habbo_auth.is_online IS 'Status online do usuário';

-- 3. Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_habbo_auth_hotel ON public.habbo_auth(hotel);
CREATE INDEX IF NOT EXISTS idx_habbo_auth_online ON public.habbo_auth(is_online);
CREATE INDEX IF NOT EXISTS idx_habbo_auth_last_login ON public.habbo_auth(last_login);

-- 4. Limpar dados duplicados ou inválidos (se existirem)
DELETE FROM public.habbo_auth 
WHERE habbo_username IS NULL 
   OR habbo_username = '' 
   OR password_hash IS NULL 
   OR password_hash = '';

-- 5. Garantir que as contas administrativas existam com dados corretos
INSERT INTO public.habbo_auth (
    habbo_username, 
    habbo_motto, 
    habbo_avatar,
    habbo_figure_string,
    habbo_unique_id,
    password_hash, 
    is_admin, 
    is_verified,
    hotel,
    is_online
) VALUES 
    ('habbohub', 'HUB-ADMIN', 
     'https://www.habbo.com/habbo-imaging/avatarimage?size=l&figure=hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61&direction=2&head_direction=2&img_format=png',
     'hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61',
     'hhus-habbohub-admin',
     '151092', 
     true, 
     true,
     'br',
     false),
    ('beebop', 'BEEBOP-ADMIN',
     'https://www.habbo.com/habbo-imaging/avatarimage?size=l&figure=hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61&direction=2&head_direction=2&img_format=png',
     'hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61',
     'hhus-beebop-admin',
     '290684', 
     true, 
     true,
     'br',
     false)
ON CONFLICT (habbo_username) DO UPDATE SET
    habbo_motto = EXCLUDED.habbo_motto,
    habbo_avatar = EXCLUDED.habbo_avatar,
    habbo_figure_string = EXCLUDED.habbo_figure_string,
    habbo_unique_id = EXCLUDED.habbo_unique_id,
    password_hash = EXCLUDED.password_hash,
    is_admin = EXCLUDED.is_admin,
    is_verified = EXCLUDED.is_verified,
    hotel = EXCLUDED.hotel,
    updated_at = NOW();

-- 6. Verificar e corrigir políticas RLS se necessário
DROP POLICY IF EXISTS "Public can view habbo users" ON public.habbo_auth;
DROP POLICY IF EXISTS "Service role can manage all habbo auth" ON public.habbo_auth;

-- Recriar políticas RLS
CREATE POLICY "Public can view habbo users" 
    ON public.habbo_auth 
    FOR SELECT 
    USING (true);

CREATE POLICY "Service role can manage all habbo auth" 
    ON public.habbo_auth 
    FOR ALL 
    USING (current_setting('role', true) = 'service_role');

-- 7. Adicionar constraint para garantir que username seja lowercase
ALTER TABLE public.habbo_auth 
ADD CONSTRAINT check_username_lowercase 
CHECK (habbo_username = LOWER(habbo_username));

-- 8. Adicionar constraint para senha não vazia
ALTER TABLE public.habbo_auth 
ADD CONSTRAINT check_password_not_empty 
CHECK (LENGTH(password_hash) > 0);

-- 9. Função para atualizar status online
CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar is_online baseado no last_login
    IF NEW.last_login IS NOT NULL AND OLD.last_login IS DISTINCT FROM NEW.last_login THEN
        NEW.is_online = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para atualizar status online automaticamente
DROP TRIGGER IF EXISTS update_online_status ON public.habbo_auth;
CREATE TRIGGER update_online_status
    BEFORE UPDATE ON public.habbo_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_user_online_status();

-- 11. Função para limpar usuários offline antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_offline_users()
RETURNS void AS $$
BEGIN
    -- Marcar como offline usuários que não fizeram login há mais de 24 horas
    UPDATE public.habbo_auth 
    SET is_online = false 
    WHERE last_login < NOW() - INTERVAL '24 hours' 
      AND is_online = true;
END;
$$ LANGUAGE plpgsql;

-- 12. Comentários finais
COMMENT ON FUNCTION update_user_online_status() IS 'Atualiza status online do usuário quando last_login é modificado';
COMMENT ON FUNCTION cleanup_old_offline_users() IS 'Marca usuários como offline se não fizeram login há mais de 24 horas';
