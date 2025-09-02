-- Add more popular users from habbo.com.br to tracking
INSERT INTO public.tracked_habbo_users (habbo_name, hotel, habbo_id, is_active) VALUES
('Sorriizx', 'com.br', 'hhbr-sorriizx', true),
('Caroll', 'com.br', 'hhbr-caroll', true),
('Maycontm', 'com.br', 'hhbr-maycontm', true),
('Marceline', 'com.br', 'hhbr-marceline', true),
('Ixabelle', 'com.br', 'hhbr-ixabelle', true),
('Paniic', 'com.br', 'hhbr-paniic', true),
('Giiuuh', 'com.br', 'hhbr-giiuuh', true),
('Reiizinha', 'com.br', 'hhbr-reiizinha', true),
('Brunno', 'com.br', 'hhbr-brunno', true),
('Gabruuh', 'com.br', 'hhbr-gabruuh', true)
ON CONFLICT (habbo_name, hotel) DO NOTHING;