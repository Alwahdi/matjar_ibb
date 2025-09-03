import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'properties_admin' | 'categories_admin' | 'notifications_admin' | 'moderator' | 'user';

export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (!error && data) {
          setRoles(data.map(r => r.role as UserRole));
        } else {
          setRoles([]);
        }
      } catch (error) {
        console.error('Roles fetch error:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: UserRole): boolean => roles.includes(role);
  
  const isAdmin = hasRole('admin');
  const isPropertiesAdmin = hasRole('properties_admin') || isAdmin;
  const isCategoriesAdmin = hasRole('categories_admin') || isAdmin;
  const isNotificationsAdmin = hasRole('notifications_admin') || isAdmin;
  const isAnyAdmin = isAdmin || isPropertiesAdmin || isCategoriesAdmin || isNotificationsAdmin;

  return { 
    roles, 
    loading, 
    hasRole, 
    isAdmin, 
    isPropertiesAdmin, 
    isCategoriesAdmin, 
    isNotificationsAdmin,
    isAnyAdmin
  };
}