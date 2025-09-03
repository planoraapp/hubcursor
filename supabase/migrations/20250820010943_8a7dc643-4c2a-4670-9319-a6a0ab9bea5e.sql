-- Add delete policy for guestbook entries
CREATE POLICY "Users can delete their own comments and home owners can delete any comment" 
ON public.guestbook_entries 
FOR DELETE 
USING (
  auth.uid() = author_user_id OR auth.uid() = home_owner_user_id
);