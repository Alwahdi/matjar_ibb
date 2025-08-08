-- Allow users to insert their own notifications
CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to insert notifications for any user
CREATE POLICY "Admins can insert any notifications"
ON public.notifications
FOR INSERT
WITH CHECK (is_admin(auth.uid()));