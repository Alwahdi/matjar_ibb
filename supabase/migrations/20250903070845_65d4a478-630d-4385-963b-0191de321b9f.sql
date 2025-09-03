-- 1) Extend app_role enum with specialized admin roles
ALTER TYPE public.app_role ADD VALUE 'properties_admin';
ALTER TYPE public.app_role ADD VALUE 'categories_admin';
ALTER TYPE public.app_role ADD VALUE 'notifications_admin';