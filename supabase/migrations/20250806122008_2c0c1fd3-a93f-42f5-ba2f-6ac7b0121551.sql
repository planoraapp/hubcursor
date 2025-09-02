
-- Add missing columns to user_stickers table
ALTER TABLE user_stickers 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'decorative',
ADD COLUMN IF NOT EXISTS rotation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scale DECIMAL(3,2) DEFAULT 1.0;

-- Update existing records to have default values
UPDATE user_stickers 
SET 
  category = COALESCE(category, 'decorative'),
  rotation = COALESCE(rotation, 0),
  scale = COALESCE(scale, 1.0)
WHERE category IS NULL OR rotation IS NULL OR scale IS NULL;
