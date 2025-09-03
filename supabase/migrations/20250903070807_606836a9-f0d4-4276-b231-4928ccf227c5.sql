-- 1) Extend app_role enum with specialized admin roles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'properties_admin'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'properties_admin';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'categories_admin'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'categories_admin';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'notifications_admin'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'notifications_admin';
  END IF;
END $$;

-- 2) Properties policies for properties_admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='properties' AND policyname='Properties admins can insert properties'
  ) THEN
    CREATE POLICY "Properties admins can insert properties"
    ON public.properties
    FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='properties' AND policyname='Properties admins can update properties'
  ) THEN
    CREATE POLICY "Properties admins can update properties"
    ON public.properties
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()))
    WITH CHECK (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='properties' AND policyname='Properties admins can delete properties'
  ) THEN
    CREATE POLICY "Properties admins can delete properties"
    ON public.properties
    FOR DELETE
    USING (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='properties' AND policyname='Properties admins can view all properties'
  ) THEN
    CREATE POLICY "Properties admins can view all properties"
    ON public.properties
    FOR SELECT
    USING (public.has_role(auth.uid(), 'properties_admin'));
  END IF;
END $$;

-- 3) Categories policies for categories_admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='Categories admins can insert categories'
  ) THEN
    CREATE POLICY "Categories admins can insert categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'categories_admin') OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='Categories admins can update categories'
  ) THEN
    CREATE POLICY "Categories admins can update categories"
    ON public.categories
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'categories_admin') OR public.is_admin(auth.uid()))
    WITH CHECK (public.has_role(auth.uid(), 'categories_admin') OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='Categories admins can delete categories'
  ) THEN
    CREATE POLICY "Categories admins can delete categories"
    ON public.categories
    FOR DELETE
    USING (public.has_role(auth.uid(), 'categories_admin') OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='Categories admins can view all categories'
  ) THEN
    CREATE POLICY "Categories admins can view all categories"
    ON public.categories
    FOR SELECT
    USING (public.has_role(auth.uid(), 'categories_admin'));
  END IF;
END $$;

-- 4) Notifications policies for notifications_admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Notifications admins can insert any notifications'
  ) THEN
    CREATE POLICY "Notifications admins can insert any notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'notifications_admin') OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Notifications admins can view all notifications'
  ) THEN
    CREATE POLICY "Notifications admins can view all notifications"
    ON public.notifications
    FOR SELECT
    USING (public.has_role(auth.uid(), 'notifications_admin') OR public.is_admin(auth.uid()));
  END IF;
END $$;