import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Onboarding from "@/components/Onboarding";
import { Home, Car, Sofa, MapPin, Smartphone, Package } from "lucide-react";
import HeaderNew from "@/components/HeaderNew";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import PropertyCard from "@/components/PropertyCardNew";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-apartment-backup.jpg";

const Index = () => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users
  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // بيانات تجريبية للأقسام
  const categories = [
    {
      title: "شقق سكنية",
      subtitle: "شقق للبيع والإيجار",
      icon: Home,
      count: 342,
      gradient: "bg-gradient-card"
    },
    {
      title: "أراضي",
      subtitle: "أراضي سكنية وتجارية",
      icon: MapPin,
      count: 156,
      gradient: "bg-gradient-card"
    },
    {
      title: "سيارات",
      subtitle: "سيارات جديدة ومستعملة",
      icon: Car,
      count: 248,
      gradient: "bg-gradient-card"
    },
    {
      title: "أثاث منزلي",
      subtitle: "أثاث وديكورات",
      icon: Sofa,
      count: 189,
      gradient: "bg-gradient-card"
    },
    {
      title: "إلكترونيات",
      subtitle: "جوالات وأجهزة",
      icon: Smartphone,
      count: 98,
      gradient: "bg-gradient-card"
    },
    {
      title: "مستلزمات عامة",
      subtitle: "مستعمل ومتنوع",
      icon: Package,
      count: 167,
      gradient: "bg-gradient-card"
    }
  ];

  // بيانات تجريبية للعقارات المميزة
  const featuredProperties = [
    {
      id: "1",
      title: "شقة فاخرة في الرياض - حي النرجس",
      price: "٤٥٠,٠٠٠ ريال",
      location: "الرياض، النرجس",
      area: "٢٥٠ متر مربع",
      bedrooms: 4,
      bathrooms: 3,
      type: "sale" as const,
      status: "new" as const,
      images: [heroImage],
      isLiked: false
    },
    {
      id: "2",
      title: "فيلا مودرن في جدة مع حديقة خاصة",
      price: "٨,٥٠٠ ريال/شهر",
      location: "جدة، الحمراء",
      area: "٤٠٠ متر مربع", 
      bedrooms: 5,
      bathrooms: 4,
      type: "rent" as const,
      status: "new" as const,
      images: [heroImage],
      isLiked: true
    },
    {
      id: "3",
      title: "شقة عائلية في الدمام قريبة من البحر",
      price: "٣٢٠,٠٠٠ ريال",
      location: "الدمام، الكورنيش",
      area: "١٨٠ متر مربع",
      bedrooms: 3,
      bathrooms: 2,
      type: "sale" as const,
      status: "used" as const,
      images: [heroImage],
      isLiked: false
    },
    {
      id: "4",
      title: "أرض تجارية في مكة المكرمة موقع استراتيجي",
      price: "١,٢٠٠,٠٠٠ ريال",
      location: "مكة، العزيزية",
      area: "٦٠٠ متر مربع",
      type: "sale" as const,
      status: "new" as const,
      images: [heroImage],
      isLiked: false
    }
  ];

  const handlePropertyLike = (id: string) => {
    console.log("تم الإعجاب بالعقار:", id);
  };

  const handlePropertyShare = (id: string) => {
    console.log("تم مشاركة العقار:", id);
  };

  const handlePropertyContact = (id: string) => {
    // فتح واتساب
    window.open("https://wa.me/966500000000?text=مرحباً، أود الاستفسار عن هذا العقار");
  };

  const handlePropertyClick = (id: string) => {
    console.log("تم النقر على العقار:", id);
  };

  const handleCategoryClick = (title: string) => {
    console.log("تم النقر على القسم:", title);
  };

  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase.from('properties').select('*').limit(4);
      if (data) setProperties(data);
    };
    fetchProperties();
  }, []);

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      
      <main>
        {/* القسم الترويجي */}
        <Hero />

        {/* الأقسام الرئيسية */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-arabic">
                استكشف جميع الأقسام
              </h2>
              <p className="text-muted-foreground text-lg font-arabic">
                اختر القسم المناسب لك واستكشف أفضل العروض المتاحة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CategoryCard
                    title={category.title}
                    subtitle={category.subtitle}
                    icon={category.icon}
                    count={category.count}
                    gradient={category.gradient}
                    onClick={() => handleCategoryClick(category.title)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* العروض المميزة */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-arabic">
                العروض المميزة
              </h2>
              <p className="text-muted-foreground text-lg font-arabic">
                أحدث وأفضل العروض العقارية المتاحة حالياً
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property, index) => (
                <div key={property.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/properties" className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-2xl font-semibold hover:shadow-glow transition-all duration-300 font-arabic inline-block">
                عرض المزيد من العقارات
              </Link>
            </div>
          </div>
        </section>

        {/* إحصائيات ومميزات */}
        <section className="py-16 px-4 bg-gradient-hero">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-arabic">
              لماذا تختار دلّالتي؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "أمان وثقة",
                  description: "جميع الدلالين معتمدين ومصرح لهم",
                  icon: "🛡️"
                },
                {
                  title: "تنوع كبير",
                  description: "آلاف العروض في جميع التصنيفات",
                  icon: "🏘️"
                },
                {
                  title: "سهولة التواصل",
                  description: "تواصل مباشر عبر واتساب",
                  icon: "📱"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2 font-arabic">{feature.title}</h3>
                  <p className="text-muted-foreground font-arabic">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* الفوتر */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent font-arabic">
              دلّالتي
            </h3>
            <p className="text-muted-foreground mt-2 font-arabic">
              منصتك الذكية للعروض العقارية والمستلزمات
            </p>
          </div>
          
          <div className="text-muted-foreground text-sm font-arabic">
            <p>© ٢٠٢٤ دلّالتي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
