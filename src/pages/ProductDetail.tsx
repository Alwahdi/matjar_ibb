import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageCircle, 
  MapPin, 
  Bed, 
  Bath, 
  Home,
  Car,
  Calendar,
  Palette,
  Package,
  Phone,
  Mail,
  User,
  Star,
  Loader2,
  ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import HeaderNew from '@/components/HeaderNew';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  location: string;
  city: string;
  neighborhood: string;
  images: string[];
  amenities: string[];
  listing_type: string;
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  size?: string;
  color?: string;
  material?: string;
  created_at: string;
  updated_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (id) {
      fetchProperty();
      if (user) checkIfLiked();
    }
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل تفاصيل العرض",
        variant: "destructive"
      });
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', id)
        .single();
      
      setIsLiked(!!data);
    } catch (error) {
      // Not liked
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول لإضافة العروض للمفضلات",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', id);
        
        setIsLiked(false);
        toast({
          title: "تم الحذف",
          description: "تم حذف العرض من المفضلات"
        });
      } else {
        await supabase
          .from('favorites')
          .insert([
            { user_id: user.id, property_id: id }
          ]);
        
        setIsLiked(true);
        toast({
          title: "تم الإضافة",
          description: "تم إضافة العرض للمفضلات"
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط العرض"
      });
    }
  };

  const handleContact = () => {
    if (property) {
      const message = `مرحباً، أود الاستفسار عن: ${property.title}`;
      const whatsappUrl = `https://wa.me/${property.agent_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'real-estate': 'عقارات',
      'cars': 'سيارات',
      'furniture': 'أثاث',
      'electronics': 'إلكترونيات',
      'clothes': 'ملابس',
      'books': 'كتب',
      'sports': 'رياضة',
      'other': 'أخرى'
    };
    return labels[category] || category;
  };

  const nextImage = () => {
    if (property && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
        <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">العرض غير موجود</h1>
          <Button onClick={() => navigate('/properties')}>
            العودة للعروض
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">الرئيسية</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-foreground">العروض</Link>
          <span>/</span>
          <span className="text-foreground">{getCategoryLabel(property.category)}</span>
        </nav>

        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6 font-arabic"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-card">
              {property.images && property.images.length > 0 ? (
                <>
                  <div className="relative aspect-video">
                    <img
                      src={property.images[currentImageIndex]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    {property.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter */}
                    {property.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                        {currentImageIndex + 1} من {property.images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {property.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {property.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              index === currentImageIndex ? 'border-primary' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`صورة ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Description */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 font-arabic">التفاصيل</h3>
                <p className="text-muted-foreground leading-relaxed font-arabic">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Main Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="font-arabic">
                    {getCategoryLabel(property.category)}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="icon"
                      onClick={toggleLike}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-4 font-arabic">
                  {property.title}
                </h1>

                <div className="text-3xl font-bold text-primary mb-4">
                  {formatPrice(property.price)}
                </div>

                <div className="flex items-center text-muted-foreground mb-6">
                  <MapPin className="w-4 h-4 ml-2" />
                  <span className="font-arabic">{property.location}</span>
                </div>

                {/* Contact Button */}
                <Button 
                  onClick={handleContact}
                  className="w-full font-arabic mb-4"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 ml-2" />
                  تواصل عبر واتساب
                </Button>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 font-arabic">المواصفات</h3>
                <div className="space-y-3">
                  {property.category === 'real-estate' && (
                    <>
                      {property.bedrooms && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-muted-foreground font-arabic">
                            <Bed className="w-4 h-4 ml-2" />
                            غرف النوم
                          </span>
                          <span className="font-semibold">{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-muted-foreground font-arabic">
                            <Bath className="w-4 h-4 ml-2" />
                            دورات المياه
                          </span>
                          <span className="font-semibold">{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area_sqm && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-muted-foreground font-arabic">
                            <Home className="w-4 h-4 ml-2" />
                            المساحة
                          </span>
                          <span className="font-semibold">{property.area_sqm} م²</span>
                        </div>
                      )}
                    </>
                  )}

                  {property.category === 'cars' && (
                    <>
                      {property.brand && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-arabic">الماركة</span>
                          <span className="font-semibold">{property.brand}</span>
                        </div>
                      )}
                      {property.model && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-arabic">الموديل</span>
                          <span className="font-semibold">{property.model}</span>
                        </div>
                      )}
                      {property.year && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-muted-foreground font-arabic">
                            <Calendar className="w-4 h-4 ml-2" />
                            السنة
                          </span>
                          <span className="font-semibold">{property.year}</span>
                        </div>
                      )}
                    </>
                  )}

                  {property.color && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-muted-foreground font-arabic">
                        <Palette className="w-4 h-4 ml-2" />
                        اللون
                      </span>
                      <span className="font-semibold">{property.color}</span>
                    </div>
                  )}

                  {property.condition && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-arabic">الحالة</span>
                      <Badge variant="outline">
                        {property.condition === 'new' ? 'جديد' : 
                         property.condition === 'excellent' ? 'ممتاز' :
                         property.condition === 'good' ? 'جيد' : property.condition}
                      </Badge>
                    </div>
                  )}

                  {property.size && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-muted-foreground font-arabic">
                        <Package className="w-4 h-4 ml-2" />
                        الحجم
                      </span>
                      <span className="font-semibold">{property.size}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Agent Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 font-arabic">معلومات البائع</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 ml-2 text-muted-foreground" />
                    <span className="font-arabic">{property.agent_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 ml-2 text-muted-foreground" />
                    <span dir="ltr">{property.agent_phone}</span>
                  </div>
                  {property.agent_email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 ml-2 text-muted-foreground" />
                      <span dir="ltr">{property.agent_email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-4 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-sm text-muted-foreground mr-2 font-arabic">
                    بائع موثق
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}