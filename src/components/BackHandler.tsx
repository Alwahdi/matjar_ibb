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
      const isAdminRoute = path.startsWith('/admin');
      // If on admin or root-level routes, go to home instead of exiting
      if (isAdminRoute) {
        navigate('/', { replace: true });
      } else if (!canGoBack) {
        // Prevent accidental exits; optionally do nothing
      }
    });

    return () => {
      remove.then((r) => r.remove()).catch(() => {});
    };
  }, [location.pathname, navigate]);

  return null;
}
