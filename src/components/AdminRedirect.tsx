import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAuth } from '@/hooks/useAuth';

export function AdminRedirect() {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if user is logged in, admin check is complete, user is admin, and not already on admin page
    if (user && !loading && isAdmin && location.pathname !== '/admin') {
      // Add a small delay to ensure smooth navigation
      const timer = setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, loading, navigate, location.pathname]);

  return null;
}