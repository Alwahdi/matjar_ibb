import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Heart, ArrowLeft, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HeaderNew from '@/components/HeaderNew';
import HeaderMobile from '@/components/HeaderMobile';
import BottomNavigation from '@/components/BottomNavigation';
import PropertyCardNew from '@/components/PropertyCardNew';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  property_type: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  neighborhood: string;
  images: string[];
  amenities: string[];
  agent_name: string;
  agent_phone: string;
  agent_email: string;
}

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [favorites, setFavorites] = useState<Property[]>([]);

  // Redirect unauthenticated users
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          property_id,
          properties (
            id,
            title,
            description,
            price,
            location,
            city,
            property_type,
            listing_type,
            bedrooms,
            bathrooms,
            area_sqm,
            neighborhood,
            images,
            amenities,
            agent_name,
            agent_phone,
            agent_email
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteProperties = data?.map(item => item.properties).filter(Boolean) as Property[];
      setFavorites(favoriteProperties || []);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل المفضلات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (propertyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      setFavorites(favorites.filter(property => property.id !== propertyId));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العرض من المفضلات"
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      </div>
      
      {/* Mobile Header */}
      <HeaderMobile isDark={isDark} toggleTheme={toggleTheme} showSearch={false} />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link to="/">
              <Button variant="outline" size="sm" className="ml-4">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-arabic flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary" />
                العروض المفضلة
              </h1>
              <p className="text-muted-foreground font-arabic">
                العروض التي أضفتها إلى قائمة المفضلات ({favorites.length} عرض)
              </p>
            </div>
          </div>

          {/* Content */}
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground font-arabic mb-4">
                لا توجد عروض مفضلة بعد
              </h2>
              <p className="text-muted-foreground font-arabic mb-6 max-w-md mx-auto">
                ابدأ بتصفح العروض وإضافة المناسب منها إلى قائمة المفضلات لسهولة المتابعة
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/properties">
                  <Button className="font-arabic flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    تصفح العروض
                  </Button>
                </Link>
                <Link to="/properties?category=real-estate">
                  <Button variant="outline" className="font-arabic">
                    عقارات
                  </Button>
                </Link>
                <Link to="/properties?category=cars">
                  <Button variant="outline" className="font-arabic">
                    سيارات
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((property, index) => (
                <div 
                  key={property.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PropertyCardNew property={property} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}