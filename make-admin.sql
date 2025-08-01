-- Helper function to make a user admin for testing
-- Usage: Run in Supabase SQL Editor, replace the email with your actual user email

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Replace 'your-email@example.com' with the actual user email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'test@example.com'  -- Change this to your email
    LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- Remove existing role if any
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (target_user_id, 'admin');
        
        RAISE NOTICE 'User % (%) has been made admin', target_user_id, 'test@example.com';
    ELSE
        RAISE NOTICE 'User not found with email: %', 'test@example.com';
    END IF;
END $$;