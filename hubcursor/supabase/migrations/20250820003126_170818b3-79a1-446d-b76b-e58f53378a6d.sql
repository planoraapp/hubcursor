-- Fix rating widget sizing to match the smaller 192x140 size
UPDATE user_home_widgets 
SET width = 192, height = 140 
WHERE widget_type = 'rating';