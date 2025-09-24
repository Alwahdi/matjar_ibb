# متجر إب الشامل - منصة العروض العقارية والتجارية

منصة شاملة للعروض العقارية والتجارية في المملكة العربية السعودية، تتيح للمستخدمين البحث عن الشقق والأراضي والسيارات والمنتجات المختلفة.

## الميزات الأساسية

### 🏠 العقارات والأملاك
- شقق سكنية للبيع والإيجار
- أراضي سكنية وتجارية
- فلل وقصور فاخرة
- عرض تفصيلي لكل عقار مع الصور والمواصفات

### 🚗 السيارات والمركبات
- سيارات جديدة ومستعملة
- دراجات نارية وهوائية
- شاحنات ومعدات ثقيلة
- قطع غيار ومستلزمات السيارات

### 🛋️ الأثاث والمنزل
- أثاث غرف النوم والمعيشة
- أجهزة منزلية وكهربائية
- ديكورات ومستلزمات المنزل
- أدوات المطبخ والحمام

### 📱 الإلكترونيات والأجهزة
- هواتف ذكية وأجهزة لوحية
- أجهزة كمبيوتر ولابتوب
- أجهزة صوتية ومرئية
- ألعاب إلكترونية وإكسسوارات

### 📦 مستلزمات عامة
- ملابس وأحذية
- كتب ومواد تعليمية
- أدوات رياضية وترفيهية
- معدات مكتبية وقرطاسية

## المميزات التقنية

### 🎨 تصميم متجاوب
- واجهة مستخدم حديثة ومريحة
- تدعم الوضع المظلم والفاتح
- متوافقة مع جميع الأجهزة (هاتف، تابلت، سطح المكتب)
- تصميم RTL مخصص للغة العربية

### 🔐 المصادقة والأمان
- نظام تسجيل دخول آمن عبر Supabase
- حماية المعلومات الشخصية
- إدارة الحسابات والملفات الشخصية
- نظام صلاحيات متقدم

### 📊 إدارة البيانات
- قاعدة بيانات PostgreSQL عبر Supabase
- تخزين آمن للملفات والصور
- نظام تحليلات وإحصائيات
- نسخ احتياطي تلقائي

### 🔔 الإشعارات والتنبيهات
- إشعارات فورية للعروض الجديدة
- تنبيهات مخصصة حسب الاهتمام
- مركز إشعارات شامل
- إعدادات تحكم في الإشعارات

### ⭐ المفضلة والحفظ
- حفظ العروض المفضلة
- إنشاء قوائم مخصصة
- مشاركة العروض مع الآخرين
- متابعة تحديثات العروض المحفوظة

### 🔍 البحث والفلترة
- بحث ذكي ومتقدم
- فلترة حسب السعر والموقع والنوع
- خرائط تفاعلية للمواقع
- اقتراحات بحث ذكية

## التقنيات المستخدمة

### Frontend
- **React 18** - مكتبة بناء واجهات المستخدم
- **TypeScript** - برمجة آمنة ومتطورة
- **Vite** - بناء سريع وتطوير محسن
- **Tailwind CSS** - تصميم CSS حديث ومرن
- **Shadcn/UI** - مكونات واجهة مستخدم عالية الجودة
- **React Router** - توجيه وتنقل في التطبيق
- **Lucide React** - أيقونات جميلة ومتنوعة

### Backend & Database
- **Supabase** - منصة Backend-as-a-Service شاملة
- **PostgreSQL** - قاعدة بيانات قوية وموثوقة
- **Row Level Security (RLS)** - أمان متقدم للبيانات
- **Real-time subscriptions** - تحديثات فورية
- **Authentication** - نظام مصادقة متكامل
- **Storage** - تخزين الملفات والوسائط

### DevOps & Tools
- **ESLint** - فحص وتحسين جودة الكود
- **PostCSS** - معالجة ملفات CSS
- **Git** - إدارة الإصدارات
- **npm/bun** - إدارة الحزم والمكتبات

## هيكل المشروع

```
src/
├── components/          # مكونات واجهة المستخدم
│   ├── ui/             # مكونات أساسية (buttons, inputs, etc.)
│   ├── Header.tsx      # رأس الصفحة
│   ├── PropertyCard.tsx # بطاقة العقار
│   ├── CategoryCard.tsx # بطاقة القسم
│   └── ...
├── pages/              # صفحات التطبيق
│   ├── Index.tsx       # الصفحة الرئيسية
│   ├── Properties.tsx  # صفحة العقارات
│   ├── Auth.tsx        # صفحة المصادقة
│   └── ...
├── hooks/              # React Hooks مخصصة
│   ├── useAuth.tsx     # إدارة المصادقة
│   ├── useFavorites.tsx # إدارة المفضلة
│   └── ...
├── integrations/       # تكاملات خارجية
│   └── supabase/       # إعدادات Supabase
├── lib/                # مكتبات مساعدة
└── assets/             # الصور والملفات الثابتة
```

## إعداد المشروع للتطوير

### متطلبات النظام
- Node.js 18 أو أحدث
- npm 8 أو أحدث (أو bun)
- Git

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd dallalti-app
```

2. **تثبيت المكتبات**
```bash
npm install
# أو
bun install
```

3. **إعداد متغيرات البيئة**
قم بإنشاء ملف `.env.local` وأضف:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **تشغيل الخادم المحلي**
```bash
npm run dev
# أو
bun run dev
```

5. **فتح التطبيق**
افتح المتصفح وانتقل إلى `http://localhost:5173`

## إعداد قاعدة البيانات

### جداول قاعدة البيانات

#### Properties (العقارات)
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL,
  location TEXT,
  area TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  type TEXT, -- 'sale' or 'rent'
  status TEXT, -- 'new' or 'used'
  images TEXT[],
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Favorites (المفضلة)
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);
```

#### Notifications (الإشعارات)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

تم تفعيل RLS على جميع الجداول مع سياسات أمان تضمن:
- المستخدمون يمكنهم رؤية وتعديل بياناتهم فقط
- العقارات عامة للقراءة لجميع المستخدمين المسجلين
- المفضلة والإشعارات خاصة بكل مستخدم

## البناء والنشر

### بناء الإنتاج
```bash
npm run build
# أو
bun run build
```

### معاينة الإنتاج محلياً
```bash
npm run preview
# أو
bun run preview
```

### النشر عبر Lovable
1. افتح [Lovable Project](https://lovable.dev/projects/8d4c67d9-26c7-413c-a5bf-ed16a91b2b6c)
2. اضغط على "Share" ثم "Publish"
3. اتبع التعليمات لربط نطاق مخصص (اختياري)

### النشر على منصات أخرى

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --build
```

## المساهمة في المشروع

### إرشادات المساهمة
1. Fork المشروع
2. إنشاء branch جديد للميزة
3. كتابة كود نظيف ومفهوم
4. إضافة تعليقات باللغة العربية
5. اختبار التغييرات
6. إرسال Pull Request

### معايير الكود
- استخدام TypeScript لجميع الملفات
- اتباع ESLint rules
- تسمية المتغيرات والدوال بالإنجليزية
- التعليقات والنصوص باللغة العربية
- استخدام Tailwind CSS للتصميم

## الدعم والمساعدة

### روابط مفيدة
- [Lovable Documentation](https://docs.lovable.dev/)
- [React Documentation](https://reactjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### التواصل
- إنشاء Issue في GitHub للمشاكل التقنية
- استخدام Discussion للأسئلة العامة
- المراجعة الدورية للتحديثات

## الرخصة

هذا المشروع مرخص تحت رخصة MIT. راجع ملف LICENSE للتفاصيل.

---

تم تطوير هذا المشروع بواسطة Lovable - منصة تطوير التطبيقات بالذكاء الاصطناعي.

**آخر تحديث:** يناير 2025
**الإصدار:** 1.0.0