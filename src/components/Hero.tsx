import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary-glow/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* العنوان الرئيسي */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 font-display">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                دلّالتي
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 font-arabic">
              منصتك الذكية للعروض العقارية
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-arabic max-w-2xl mx-auto leading-relaxed">
              اكتشف أفضل العروض العقارية والمستلزمات في مكان واحد. شقق، أراضي، أثاث، سيارات، ومستعمل بأسعار مميزة
            </p>
          </div>

          {/* شريط البحث المتقدم */}
          <div className="bg-card/80 backdrop-blur-lg rounded-3xl p-6 shadow-elegant border border-border/30 max-w-3xl mx-auto animate-scale-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* البحث */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder="ابحث عن شقق، أراضي، سيارات..."
                    className="pr-12 h-12 bg-background/50 border-border/50 focus:ring-primary/50 text-right font-arabic"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* الموقع */}
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="المدينة أو الحي"
                  className="pr-12 h-12 bg-background/50 border-border/50 focus:ring-primary/50 text-right font-arabic"
                  dir="rtl"
                />
              </div>

              {/* زر البحث */}
              <Button className="h-12 bg-gradient-primary hover:shadow-glow transition-all duration-300 font-arabic text-lg">
                <Search className="w-5 h-5 ml-2" />
                ابحث
              </Button>
            </div>

            {/* فلاتر سريعة */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['شقق للبيع', 'شقق للإيجار', 'أراضي', 'سيارات', 'أثاث'].map((filter) => (
                <Button 
                  key={filter}
                  variant="outline" 
                  size="sm"
                  className="bg-background/50 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-arabic"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { number: '١٠٠٠+', label: 'عقار متاح' },
              { number: '٥٠٠+', label: 'دلال معتمد' },
              { number: '٢٠٠٠+', label: 'عميل راضي' },
              { number: '٢٤/٧', label: 'دعم فني' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 font-arabic">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-arabic">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* تأثيرات الخلفية */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};

export default Hero;