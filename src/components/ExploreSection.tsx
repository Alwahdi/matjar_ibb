import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Car, Sofa, MapPin, Smartphone, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
interface CategoryOption {
  id: string;
  title: string;
  count: number;
  description: string;
}

interface Category {
  title: string;
  subtitle: string;
  icon: any;
  count: number;
  gradient: string;
  options?: CategoryOption[];
}

const ExploreSection = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dynamicCounts, setDynamicCounts] = useState<Record<string, number>>({});
  const categories: Category[] = [
    {
      title: "شقق سكنية",
      subtitle: "شقق للبيع والإيجار",
      icon: Home,
      count: 342,
      gradient: "bg-gradient-card",
      options: [
        { id: "1-room", title: "غرفة واحدة", count: 45, description: "استوديو أو غرفة واحدة" },
        { id: "2-rooms", title: "غرفتان", count: 89, description: "شقق بغرفتي نوم" },
        { id: "3-rooms", title: "ثلاث غرف", count: 126, description: "شقق عائلية بثلاث غرف" },
        { id: "4-plus-rooms", title: "أربع غرف أو أكثر", count: 82, description: "شقق كبيرة للعائلات الكبيرة" }
      ]
    },
    {
      title: "أراضي",
      subtitle: "أراضي سكنية وتجارية",
      icon: MapPin,
      count: 156,
      gradient: "bg-gradient-card",
      options: [
        { id: "residential", title: "أراضي سكنية", count: 89, description: "للإسكان الشخصي" },
        { id: "commercial", title: "أراضي تجارية", count: 45, description: "للمشاريع التجارية" },
        { id: "agricultural", title: "أراضي زراعية", count: 22, description: "للأنشطة الزراعية" }
      ]
    },
    {
      title: "سيارات",
      subtitle: "سيارات جديدة ومستعملة",
      icon: Car,
      count: 248,
      gradient: "bg-gradient-card",
      options: [
        { id: "new-cars", title: "سيارات جديدة", count: 78, description: "موديلات حديثة" },
        { id: "used-cars", title: "سيارات مستعملة", count: 170, description: "بحالة ممتازة" }
      ]
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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const filters: Record<string, { category?: string; property_type?: string }> = {
          'شقق سكنية': { category: 'real-estate' },
          'أراضي': { property_type: 'land' },
          'سيارات': { category: 'cars' },
          'أثاث منزلي': { category: 'furniture' },
          'إلكترونيات': { category: 'electronics' },
          'مستلزمات عامة': { category: 'general' },
        };

        const entries = Object.entries(filters);
        const results = await Promise.all(entries.map(async ([title, f]) => {
          let query = supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
          if (f.category) query = query.eq('category', f.category);
          if (f.property_type) query = query.eq('property_type', f.property_type);
          const { count } = await query;
          return [title, count || 0] as const;
        }));

        const mapped: Record<string, number> = {};
        results.forEach(([title, count]) => {
          mapped[title] = count;
        });
        setDynamicCounts(mapped);
      } catch (e) {
        console.error('Failed to load category counts', e);
      }
    };
    fetchCounts();
  }, []);

  const handleCategoryClick = (category: Category) => {
    if (category.options) {
      setSelectedCategory(selectedCategory === category.title ? null : category.title);
    } else {
      navigate(`/properties?category=${encodeURIComponent(category.title)}`);
    }
  };

  const handleOptionClick = (categoryTitle: string, option: CategoryOption) => {
    navigate(`/properties?category=${encodeURIComponent(categoryTitle)}&subcategory=${encodeURIComponent(option.id)}`);
  };

  const selectedCategoryData = categories.find(c => c.title === selectedCategory);

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-arabic">
            استكشف جميع الأقسام
          </h2>
          <p className="text-muted-foreground text-lg font-arabic">
            اختر القسم المناسب لك واستكشف أفضل العروض المتاحة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const isExpanded = selectedCategory === category.title;
            
            return (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <Card 
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm ${
                    isExpanded ? 'ring-2 ring-primary/50 shadow-glow' : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-primary shadow-glow">
                          <IconComponent className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold text-foreground mb-1 font-arabic group-hover:text-primary transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-sm text-muted-foreground font-arabic">
                            {category.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary font-arabic">
                            {dynamicCounts[category.title] ?? category.count}
                          </div>
                          <div className="text-xs text-muted-foreground font-arabic">
                            عرض متاح
                          </div>
                        </div>
                        {category.options && (
                          <ChevronRight 
                            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                              isExpanded ? 'rotate-90' : ''
                            }`} 
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expandable Options */}
                {isExpanded && selectedCategoryData?.options && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    {selectedCategoryData.options.map((option, optionIndex) => (
                      <Card 
                        key={option.id}
                        className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-muted/50 border-border/30 bg-muted/20 backdrop-blur-sm ml-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick(selectedCategoryData.title, option);
                        }}
                        style={{ animationDelay: `${optionIndex * 0.1}s` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-right flex-1">
                              <h4 className="font-semibold text-foreground mb-1 font-arabic group-hover:text-primary transition-colors">
                                {option.title}
                              </h4>
                              <p className="text-sm text-muted-foreground font-arabic">
                                {option.description}
                              </p>
                            </div>
                            <div className="text-left ml-4">
                              <div className="text-lg font-bold text-primary font-arabic">
                                {option.count}
                              </div>
                              <div className="text-xs text-muted-foreground font-arabic">
                                عرض
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/properties')} 
            className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-2xl font-semibold hover:shadow-glow transition-all duration-300 font-arabic"
          >
            عرض جميع الأقسام
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;