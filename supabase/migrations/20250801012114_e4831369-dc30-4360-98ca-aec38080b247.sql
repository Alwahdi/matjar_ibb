-- Quick function to make a user admin for testing (run manually in SQL editor)
-- Replace 'your-user-email@example.com' with actual user email
/*
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get user ID from auth.users (replace email with actual user email)
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'your-user-email@example.com' 
    LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- Remove existing role if any
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (target_user_id, 'admin');
        
        RAISE NOTICE 'User % has been made admin', target_user_id;
    ELSE
        RAISE NOTICE 'User not found with that email';
    END IF;
END $$;
*/

-- Example usage: Uncomment and replace email, then run in SQL editor
-- Just creating a comment block for now since we need the actual user email