-- إنشاء enum للأدوار
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- إنشاء جدول أدوار المستخدمين
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- تفعيل RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- إنشاء function للتحقق من الأدوار (security definer لتجنب المشاكل الدورية)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- إنشاء function للتحقق من كون المستخدم admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- إضافة عمود لإيقاف المستخدمين في جدول profiles
ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN suspended_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN suspended_by UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN suspension_reason TEXT;

-- سياسات RLS لجدول user_roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- تحديث سياسات profiles للسماح للإداريين بإدارة جميع الملفات
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id)
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- سياسات العقارات للإداريين
CREATE POLICY "Admins can delete properties"
ON public.properties
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all properties"
ON public.properties
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()) OR status = 'active');

-- trigger لتحديث updated_at في user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إدراج admin افتراضي (سيحتاج المستخدم لتعديل هذا لاحقاً)
-- هذا مجرد مثال ويجب على المستخدم إضافة user_id الحقيقي
-- INSERT INTO public.user_roles (user_id, role) VALUES ('USER_ID_HERE', 'admin');