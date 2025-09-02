
-- Criar tabela principal para itens de roupas HabboEmotion
CREATE TABLE IF NOT EXISTS public.habbo_emotion_clothing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  part TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'U',
  club TEXT NOT NULL DEFAULT 'FREE',
  colors JSONB NOT NULL DEFAULT '["1"]'::jsonb,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'habboemotion',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(item_id, code)
);

-- Criar tabela de cores oficiais do Habbo
CREATE TABLE IF NOT EXISTS public.habbo_emotion_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  color_id TEXT NOT NULL UNIQUE,
  hex_code TEXT NOT NULL,
  color_name TEXT,
  is_hc BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento item-cores
CREATE TABLE IF NOT EXISTS public.habbo_emotion_item_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clothing_item_id UUID NOT NULL REFERENCES public.habbo_emotion_clothing(id) ON DELETE CASCADE,
  color_id TEXT NOT NULL REFERENCES public.habbo_emotion_colors(color_id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(clothing_item_id, color_id)
);

-- Criar tabela de cache da API
CREATE TABLE IF NOT EXISTS public.habbo_emotion_api_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  response_data JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '6 hours'),
  item_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success'
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.habbo_emotion_clothing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_item_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habbo_emotion_api_cache ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leitura pública
CREATE POLICY "Allow public read access to clothing items" 
  ON public.habbo_emotion_clothing 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Allow public read access to colors" 
  ON public.habbo_emotion_colors 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to item colors" 
  ON public.habbo_emotion_item_colors 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to api cache" 
  ON public.habbo_emotion_api_cache 
  FOR SELECT 
  USING (expires_at > now());

-- Políticas RLS para service role (escrita)
CREATE POLICY "Allow service role to manage clothing items" 
  ON public.habbo_emotion_clothing 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage colors" 
  ON public.habbo_emotion_colors 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage item colors" 
  ON public.habbo_emotion_item_colors 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage api cache" 
  ON public.habbo_emotion_api_cache 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_part ON public.habbo_emotion_clothing(part);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_gender ON public.habbo_emotion_clothing(gender);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_club ON public.habbo_emotion_clothing(club);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_clothing_active ON public.habbo_emotion_clothing(is_active);
CREATE INDEX IF NOT EXISTS idx_habbo_emotion_api_cache_expires ON public.habbo_emotion_api_cache(expires_at);

-- Inserir cores básicas do Habbo (usando dados do habboColors.ts)
INSERT INTO public.habbo_emotion_colors (color_id, hex_code, color_name, is_hc) VALUES
('1', 'DDDDDD', 'Cinza Claro', false),
('2', '96743D', 'Marrom', false),
('3', '6B573B', 'Marrom Escuro', false),
('4', 'E7B027', 'Amarelo', false),
('5', 'fff7b7', 'Amarelo Claro', false),
('6', 'F8C790', 'Pele', false),
('7', '9F2B31', 'Vermelho Escuro', false),
('8', 'ED5C50', 'Vermelho', false),
('9', 'FFBFC2', 'Rosa Claro', false),
('10', 'E7D1EE', 'Roxo Claro', false),
('11', 'AC94B3', 'Roxo', false),
('12', '7E5B90', 'Roxo Escuro', false),
('13', '4F7AA2', 'Azul', false),
('14', '75B7C7', 'Azul Claro', false),
('15', 'C5EDE6', 'Ciano Claro', false),
('16', 'BBF3BD', 'Verde Claro', false),
('17', '6BAE61', 'Verde', false),
('18', '456F40', 'Verde Escuro', false),
('19', '7A7D22', 'Verde Oliva', false),
('20', '595959', 'Cinza', false),
('21', '1E1E1E', 'Preto HC', true),
('22', '84573c', 'Marrom HC', true),
('23', 'A86B19', 'Dourado HC', true),
('24', 'c69f71', 'Bege HC', true),
('25', 'F3E1AF', 'Creme HC', true),
('26', 'FFFFFF', 'Branco HC', true),
('27', 'FFF41D', 'Amarelo Neon HC', true),
('28', 'ffe508', 'Amarelo HC', true),
('29', 'ffcc00', 'Ouro HC', true),
('30', 'ffa508', 'Laranja Claro HC', true),
('31', 'FF9211', 'Laranja HC', true),
('32', 'ff5b08', 'Laranja Escuro HC', true),
('33', 'C74400', 'Vermelho Laranja HC', true),
('34', 'da6a43', 'Terra Cotta HC', true),
('35', 'b18276', 'Rosa Seco HC', true),
('36', 'ae4747', 'Vermelho Rosado HC', true),
('37', '813033', 'Bordô HC', true),
('38', '5b2420', 'Marrom Avermelhado HC', true),
('39', '9B001D', 'Vermelho Escuro HC', true),
('40', 'd2183c', 'Vermelho Vivo HC', true),
('41', 'e53624', 'Vermelho HC', true),
('42', 'FF1300', 'Vermelho Neon HC', true),
('43', 'ff638f', 'Rosa HC', true),
('44', 'fe86b1', 'Rosa Claro HC', true),
('45', 'FF6D8F', 'Rosa Médio HC', true),
('46', 'ffc7e4', 'Rosa Pastel HC', true),
('47', 'E993FF', 'Roxo Claro HC', true),
('48', 'ff88f4', 'Magenta HC', true),
('49', 'FF27A6', 'Pink HC', true),
('50', 'C600AD', 'Roxo Pink HC', true),
('61', '92', 'Azul Padrão', false),
('92', '1', 'Branco Padrão', false),
('100', '100', 'Cor 100', false),
('101', '101', 'Cor 101', false),
('102', '102', 'Cor 102', false),
('104', '104', 'Cor 104', false),
('105', '105', 'Cor 105', false),
('106', '106', 'Cor 106', false),
('143', '143', 'Cor 143', false)
ON CONFLICT (color_id) DO NOTHING;
