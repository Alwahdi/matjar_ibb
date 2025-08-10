import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

// Handles Android hardware back button: when on admin or any nested admin route,
// navigate back to home instead of default behavior
export default function BackHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const remove = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const path = location.pathname;
      const goHomeRoutes = [
        '/admin', '/properties', '/favorites', '/account', '/landing', '/privacy'
      ];
      const isAdminRoute = path.startsWith('/admin');
      const isProductRoute = path.startsWith('/product/');
      const shouldGoHome = isAdminRoute || isProductRoute || goHomeRoutes.includes(path);

      if (shouldGoHome) {
        navigate('/', { replace: true });
      } else if (!canGoBack) {
        // Stay on current page to prevent accidental exit
      }
    });

    return () => {
      remove.then((r) => r.remove()).catch(() => {});
    };
  }, [location.pathname, navigate]);

  return null;
}
