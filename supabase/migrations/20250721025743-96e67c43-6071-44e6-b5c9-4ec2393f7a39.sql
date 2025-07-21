-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'villa', 'office', 'land', 'commercial')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm DECIMAL(8,2),
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  listing_type TEXT NOT NULL CHECK (listing_type IN ('rent', 'sale')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented', 'inactive')),
  agent_id UUID,
  agent_name TEXT,
  agent_phone TEXT,
  agent_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'agent', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for properties (public read, authenticated users can manage their own)
CREATE POLICY "Anyone can view active properties" 
ON public.properties 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Agents can insert properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Agents can update their own properties" 
ON public.properties 
FOR UPDATE 
USING (auth.uid()::text = agent_id);

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.properties (title, description, price, property_type, bedrooms, bathrooms, area_sqm, location, city, neighborhood, listing_type, agent_name, agent_phone, agent_email, images, amenities) VALUES
('شقة فاخرة في الرياض', 'شقة مفروشة بالكامل مع إطلالة رائعة على المدينة', 850000.00, 'apartment', 3, 2, 120.5, 'حي العليا، الرياض', 'الرياض', 'العليا', 'sale', 'أحمد محمد', '+966501234567', 'ahmed@example.com', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], ARRAY['مكيف', 'مصعد', 'موقف سيارة', 'حديقة']),
('فيلا راقية في جدة', 'فيلا حديثة مع حديقة خاصة ومسبح', 1200000.00, 'villa', 5, 4, 350.0, 'حي الزهراء، جدة', 'جدة', 'الزهراء', 'sale', 'فاطمة العلي', '+966502345678', 'fatima@example.com', ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'], ARRAY['مسبح', 'حديقة', 'مكيفات', 'مطبخ مجهز']),
('شقة للإيجار في الدمام', 'شقة نظيفة ومريحة قريبة من الخدمات', 2500.00, 'apartment', 2, 1, 85.0, 'حي الفيصلية، الدمام', 'الدمام', 'الفيصلية', 'rent', 'سعد الخالد', '+966503456789', 'saad@example.com', ARRAY['https://images.unsplash.com/photo-1571604831262-dc1a7b4b1d0b?w=800'], ARRAY['مكيف', 'قريب من المترو', 'موقف سيارة']),
('مكتب تجاري في الرياض', 'مكتب حديث في برج تجاري راقي', 180000.00, 'office', NULL, 1, 95.0, 'حي الملك فهد، الرياض', 'الرياض', 'الملك فهد', 'sale', 'خالد الأحمد', '+966504567890', 'khalid@example.com', ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'], ARRAY['مكيف مركزي', 'أمن 24 ساعة', 'مصاعد سريعة']),
('أرض للبيع في مكة', 'أرض سكنية في موقع مميز', 450000.00, 'land', NULL, NULL, 600.0, 'حي النوارية، مكة المكرمة', 'مكة المكرمة', 'النوارية', 'sale', 'محمد الغامدي', '+966505678901', 'mohammed@example.com', ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'], ARRAY['موقع مميز', 'قريب من الحرم', 'خدمات متكاملة']);