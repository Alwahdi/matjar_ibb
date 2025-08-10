-- Allow admins to update any properties
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'properties' 
      AND policyname = 'Admins can update properties'
  ) THEN
    CREATE POLICY "Admins can update properties"
    ON public.properties
    FOR UPDATE
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;