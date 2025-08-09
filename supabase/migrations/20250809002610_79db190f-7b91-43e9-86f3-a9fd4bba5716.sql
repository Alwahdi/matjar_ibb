-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  subtitle text,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  order_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (status = 'active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all categories"
  ON public.categories FOR SELECT
  USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger for updated_at
DO $$ BEGIN
  CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed initial categories if not present
INSERT INTO public.categories (title, subtitle, slug, description, icon, order_index)
VALUES
  ('شقق سكنية', 'شقق للبيع والإيجار', 'real-estate', 'عقارات سكنية متنوعة', 'Home', 1),
  ('أراضي', 'أراضي سكنية وتجارية', 'land', 'أراضي بمختلف الاستخدامات', 'MapPin', 2),
  ('سيارات', 'سيارات جديدة ومستعملة', 'cars', 'مجموعة واسعة من السيارات', 'Car', 3),
  ('أثاث منزلي', 'أثاث وديكورات', 'furniture', 'أثاث ومستلزمات المنزل', 'Sofa', 4),
  ('إلكترونيات', 'جوالات وأجهزة', 'electronics', 'أجهزة إلكترونية', 'Smartphone', 5),
  ('مستلزمات عامة', 'مستعمل ومتنوع', 'general', 'مستلزمات متنوعة', 'Package', 6)
ON CONFLICT (slug) DO NOTHING;

-- Create category_roles table for per-category moderators
CREATE TABLE IF NOT EXISTS public.category_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'moderator',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id)
);

ALTER TABLE public.category_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage category roles"
  ON public.category_roles
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own category roles"
  ON public.category_roles FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;