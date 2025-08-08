-- Enable insert policy for notifications so apps can create them
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Apps can insert notifications for users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Add a trigger to update the updated_at timestamp
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();