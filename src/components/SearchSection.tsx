import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const SearchSection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.set('search', searchTerm);
    if (location) searchParams.set('location', location);
    navigate(`/properties?${searchParams.toString()}`);
  };

  const handleQuickFilter = (filter: string) => {
    navigate(`/properties?category=${encodeURIComponent(filter)}`);
  };

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-arabic">
            ابحث عن ما تريد
          </h2>
          <p className="text-lg text-muted-foreground font-arabic">
            اكتشف أفضل العروض بسهولة وسرعة
          </p>
        </div>

        {/* البحث المتقدم */}
        <Card className="bg-card/80 backdrop-blur-lg shadow-elegant border border-border/30 max-w-4xl mx-auto animate-scale-in">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* البحث */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder="ابحث عن شقق، أراضي، سيارات..."
                    className="pr-12 h-12 bg-background/50 border-border/50 focus:ring-primary/50 text-right font-arabic"
                    dir="rtl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* زر البحث */}
              <Button 
                className="h-12 bg-gradient-primary hover:shadow-glow transition-all duration-300 font-arabic text-lg"
                onClick={handleSearch}
              >
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
                  onClick={() => handleQuickFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SearchSection;