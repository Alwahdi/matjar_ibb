import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FavoriteProperty {
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

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

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

      const favoriteProperties = data?.map(item => item.properties).filter(Boolean) as FavoriteProperty[];
      const ids = new Set(favoriteProperties.map(p => p.id));
      
      setFavorites(favoriteProperties || []);
      setFavoriteIds(ids);
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

  const addToFavorites = async (propertyId: string) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يجب تسجيل الدخول لإضافة العقارات للمفضلة",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "تنبيه",
            description: "هذا العقار موجود بالفعل في المفضلة",
            variant: "default"
          });
          return false;
        }
        throw error;
      }

      setFavoriteIds(prev => new Set([...prev, propertyId]));
      
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة العقار إلى المفضلة",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      
      setFavorites(prev => prev.filter(property => property.id !== propertyId));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العقار من المفضلة"
      });

      return true;
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (favoriteIds.has(propertyId)) {
      return await removeFromFavorites(propertyId);
    } else {
      return await addToFavorites(propertyId);
    }
  };

  const isFavorite = (propertyId: string) => favoriteIds.has(propertyId);

  // Subscribe to real-time favorites changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch favorites when changes occur
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  return {
    favorites,
    favoriteIds,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    fetchFavorites
  };
};