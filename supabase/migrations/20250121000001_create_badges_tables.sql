-- Migration: Create badges tables
-- Description: Create tables for storing Habbo badges with categories and metadata

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  hotel VARCHAR(10),
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create badge_categories table for many-to-many relationship
CREATE TABLE IF NOT EXISTS badge_categories (
  id SERIAL PRIMARY KEY,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(badge_id, category)
);

-- Create badge_countries table for country mapping
CREATE TABLE IF NOT EXISTS badge_countries (
  id SERIAL PRIMARY KEY,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  country VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(badge_id, country)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_badges_code ON badges(code);
CREATE INDEX IF NOT EXISTS idx_badges_hotel ON badges(hotel);
CREATE INDEX IF NOT EXISTS idx_badges_created_at ON badges(created_at);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_badge_categories_badge_id ON badge_categories(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_categories_category ON badge_categories(category);
CREATE INDEX IF NOT EXISTS idx_badge_countries_badge_id ON badge_countries(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_countries_country ON badge_countries(country);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_badges_updated_at 
    BEFORE UPDATE ON badges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO badge_categories (badge_id, category) 
SELECT id, 'all' FROM badges 
WHERE NOT EXISTS (SELECT 1 FROM badge_categories WHERE category = 'all')
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badges TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badge_categories TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON badge_countries TO authenticated;
