import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNavigationCache, useUserPreferences } from '@/hooks/useLocalStorage';
import { useRouteTracking } from '@/hooks/useRouteTracking';

// Component to manage application-wide caching and state persistence
const CacheManager = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { lastRoute } = useNavigationCache();
  const { preferences } = useUserPreferences();
  const { shouldRestoreSession, getLastSession } = useRouteTracking();

  // Restore user's last session if appropriate
  useEffect(() => {
    // Only restore session for authenticated users
    if (user && shouldRestoreSession()) {
      const lastSession = getLastSession();
      
      // Only restore if user was on a different page and it wasn't the auth page
      if (lastSession && 
          lastSession.path !== location.pathname && 
          !lastSession.path.includes('/auth') &&
          !lastSession.path.includes('/landing')) {
        
        // Ask user if they want to restore their session
        const shouldRestore = window.confirm(
          'هل تريد العودة إلى آخر صفحة كنت تتصفحها؟'
        );
        
        if (shouldRestore) {
          navigate(lastSession.path + lastSession.search);
        }
      }
    }
  }, [user, location.pathname, navigate, shouldRestoreSession, getLastSession]);

  // Sync favorites with cache when user logs in
  useEffect(() => {
    if (user) {
      // This could be expanded to sync favorites, search history, etc.
      // For now, we just clear any guest data if needed
      console.log('User authenticated, syncing cache...');
    }
  }, [user]);

  // Preload critical data
  useEffect(() => {
    // Preload any critical data that should be cached
    if (preferences.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }, [preferences.language]);

  // This component doesn't render anything, it just manages cache
  return null;
};

export default CacheManager;