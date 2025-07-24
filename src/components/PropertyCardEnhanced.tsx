import { useState } from 'react';
import { Heart, Share2, MessageCircle, Eye, Bed, Bath, Square, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

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

interface PropertyCardEnhancedProps {
  property: Property;
  className?: string;
}

export default function PropertyCardEnhanced({ property, className }: PropertyCardEnhancedProps) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { createNotification } = useNotifications();
  const [viewCount] = useState(Math.floor(Math.random() * 200) + 50);
  const [isLiked, setIsLiked] = useState(isFavorite(property.id));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'apartment': 'شقة',
      'villa': 'فيلا',
      'house': 'منزل',
      'commercial': 'تجاري',
      'land': 'أرض',
      'office': 'مكتب',
    };
    return types[type] || type;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await toggleFavorite(property.id);
    if (success) {
      setIsLiked(!isLiked);
      
      // Create notification for successful favorite action
      if (!isLiked) {
        await createNotification({
          title: "تمت الإضافة للمفضلة",
          message: `تم إضافة "${property.title}" إلى قائمة المفضلات`,
          type: "success",
          read: false,
          action_url: `/property/${property.id}`
        });
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: `${window.location.origin}/property/${property.id}`
        });
        
        await createNotification({
          title: "تم المشاركة",
          message: `تم مشاركة "${property.title}" بنجاح`,
          type: "success",
          read: false
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback for browsers that don't support native sharing
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
        await createNotification({
          title: "تم النسخ",
          message: "تم نسخ رابط العقار إلى الحافظة",
          type: "success",
          read: false
        });
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `مرحباً، أنا مهتم بالعقار: ${property.title}\nالسعر: ${formatPrice(property.price)}\nالموقع: ${property.location}, ${property.city}`;
    const whatsappUrl = `https://wa.me/${property.agent_phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    createNotification({
      title: "تم التواصل مع الوكيل",
      message: `تم فتح المحادثة مع ${property.agent_name}`,
      type: "info",
      read: false
    });
  };

  const handleClick = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group relative bg-card rounded-xl border border-border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images?.[0] || '/placeholder.svg'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            {property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
          </Badge>
          <Badge variant="outline" className="bg-background/90 text-foreground border-border">
            {getPropertyTypeLabel(property.property_type)}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "h-8 w-8 p-0 bg-background/90 hover:bg-background",
              isLiked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* View Count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/90 rounded-full px-2 py-1">
          <Eye className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{viewCount}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Price and Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 font-arabic">
              {property.title}
            </h3>
            <span className="text-xl font-bold text-primary font-arabic">
              {formatPrice(property.price)}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground font-arabic">
            <MapPin className="w-4 h-4 ml-1" />
            <span className="line-clamp-1">{property.neighborhood}, {property.city}</span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="font-arabic">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span className="font-arabic">{property.bathrooms}</span>
            </div>
          )}
          {property.area_sqm > 0 && (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span className="font-arabic">{property.area_sqm} م²</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs font-arabic">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs font-arabic">
                +{property.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Contact Button */}
        <Button
          onClick={handleContact}
          className="w-full font-arabic flex items-center gap-2"
          variant="outline"
        >
          <MessageCircle className="w-4 h-4" />
          تواصل عبر واتساب
        </Button>
      </div>
    </div>
  );
}