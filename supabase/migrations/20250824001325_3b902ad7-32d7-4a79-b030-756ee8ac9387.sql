-- Create function to cleanup old daily activities
CREATE OR REPLACE FUNCTION cleanup_old_daily_activities()
RETURNS VOID AS $$
BEGIN
  DELETE FROM daily_friend_activities 
  WHERE activity_date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;