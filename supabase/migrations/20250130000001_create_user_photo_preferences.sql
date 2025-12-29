-- ========================================
-- CREATE USER_PHOTO_PREFERENCES TABLE
-- ========================================
-- Esta migration cria a tabela user_photo_preferences para armazenar
-- as preferências de visibilidade de fotos dos usuários

CREATE TABLE IF NOT EXISTS user_photo_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habbo_name TEXT NOT NULL,
  hotel TEXT NOT NULL DEFAULT 'br',
  photo_id TEXT NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, photo_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS user_photo_preferences_user_id_idx ON user_photo_preferences(user_id);
CREATE INDEX IF NOT EXISTS user_photo_preferences_habbo_name_hotel_idx ON user_photo_preferences(habbo_name, hotel);
CREATE INDEX IF NOT EXISTS user_photo_preferences_photo_id_idx ON user_photo_preferences(photo_id);

-- Enable RLS
ALTER TABLE user_photo_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own photo preferences" ON user_photo_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photo preferences" ON user_photo_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photo preferences" ON user_photo_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photo preferences" ON user_photo_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_photo_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_photo_preferences_updated_at
  BEFORE UPDATE ON user_photo_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_photo_preferences_updated_at();

-- Comentários para documentação
COMMENT ON TABLE user_photo_preferences IS 'Armazena as preferências de visibilidade de fotos dos usuários';
COMMENT ON COLUMN user_photo_preferences.user_id IS 'ID do usuário autenticado (referência a auth.users)';
COMMENT ON COLUMN user_photo_preferences.habbo_name IS 'Nome do Habbo do usuário (para facilitar queries)';
COMMENT ON COLUMN user_photo_preferences.hotel IS 'Hotel do usuário (br, com.br, etc.)';
COMMENT ON COLUMN user_photo_preferences.photo_id IS 'ID da foto que foi ocultada/restaurada';
COMMENT ON COLUMN user_photo_preferences.is_hidden IS 'Se true, a foto está oculta; se false, está visível';
