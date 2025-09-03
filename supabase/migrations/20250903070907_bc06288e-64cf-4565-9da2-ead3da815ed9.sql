-- 2) Properties policies for properties_admin
CREATE POLICY "Properties admins can insert properties"
ON public.properties
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()));

CREATE POLICY "Properties admins can update properties"
ON public.properties
FOR UPDATE
USING (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()));

CREATE POLICY "Properties admins can delete properties"
ON public.properties
FOR DELETE
USING (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()));

CREATE POLICY "Properties admins can view all properties"
ON public.properties
FOR SELECT
USING (public.has_role(auth.uid(), 'properties_admin') OR public.is_admin(auth.uid()) OR status = 'active');

-- 3) Categories policies for categories_admin  
CREATE POLICY "Categories admins can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'categories_admin') OR public.is_admin(auth.uid()));

CREATE POLICY "Categories admins can update categories"
ON public.categories
FOR UPDATE
USING (public.has_role(auth.uid(), 'categories_admin') OR public.is_admin(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'categories_admin') OR public.is_admin(auth.uid()));

CREATE POLICY "Categories admins can delete categories"
ON public.categories
FOR DELETE
USING (public.has_role(auth.uid(), 'categories_admin') OR public.is_admin(auth.uid()));

-- 4) Notifications policies for notifications_admin
CREATE POLICY "Notifications admins can insert any notifications"
ON public.notifications
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'notifications_admin') OR public.is_admin(auth.uid()));

CREATE POLICY "Notifications admins can view all notifications"
ON public.notifications
FOR SELECT
USING (public.has_role(auth.uid(), 'notifications_admin') OR public.is_admin(auth.uid()) OR auth.uid() = user_id);