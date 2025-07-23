-- Update properties table to support marketplace categories
-- Add new property types for the marketplace
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_property_type_check;

-- Update property_type to support all marketplace categories
-- Real estate: apartment, villa, house, land, commercial
-- Vehicles: car, motorcycle, truck, bus
-- Home: furniture, appliances, electronics, tools
-- General: clothes, books, sports, other

-- Add category field to group items by major category
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'real-estate';

-- Update listing_type to be more generic
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_listing_type_check;

-- Add more descriptive fields for different categories
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS material TEXT;

-- Insert sample data for different categories
INSERT INTO public.properties (
  title, description, price, category, property_type, listing_type,
  location, city, images, agent_name, agent_phone, agent_email, brand, model, year, condition
) VALUES 
-- Cars
(
  'BMW X5 2020 فل كامل',
  'سيارة BMW X5 موديل 2020، فل كامل، حالة ممتازة، صيانة دورية، لون أسود معدني',
  180000,
  'cars',
  'suv',
  'for_sale',
  'الرياض، حي الملك فهد',
  'الرياض',
  ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'],
  'أحمد السعد',
  '+966501234567',
  'ahmed@example.com',
  'BMW',
  'X5',
  2020,
  'excellent'
),
-- Furniture
(
  'طقم أريكة مودرن 7 مقاعد',
  'طقم أريكة مودرن جديد، 7 مقاعد، لون بيج، قماش عالي الجودة، مع طاولة وسط',
  8500,
  'furniture',
  'sofa',
  'for_sale',
  'جدة، حي الصفا',
  'جدة',
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
  'محمد العتيبي',
  '+966509876543',
  'mohammed@example.com',
  'ميداس',
  'كلاسيك مودرن',
  2024,
  'new'
),
-- Electronics
(
  'آيفون 15 برو ماكس 256GB',
  'آيفون 15 برو ماكس، 256 جيجا، لون أزرق تيتانيوم، حالة ممتازة مع الكرتون والشاحن',
  4200,
  'electronics',
  'smartphone',
  'for_sale',
  'الدمام، الكورنيش',
  'الدمام',
  ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'],
  'سارة القحطاني',
  '+966556789012',
  'sara@example.com',
  'Apple',
  'iPhone 15 Pro Max',
  2023,
  'excellent'
),
-- Land
(
  'أرض سكنية في الخبر 800 متر',
  'أرض سكنية في حي الراكة بالخبر، مساحة 800 متر مربع، شارعين، موقع مميز',
  320000,
  'real-estate',
  'land',
  'for_sale',
  'الخبر، الراكة',
  'الخبر',
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
  'خالد الزهراني',
  '+966554433221',
  'khalid@example.com',
  NULL,
  NULL,
  NULL,
  'good'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_brand ON public.properties(brand);
CREATE INDEX IF NOT EXISTS idx_properties_year ON public.properties(year);
CREATE INDEX IF NOT EXISTS idx_properties_condition ON public.properties(condition);