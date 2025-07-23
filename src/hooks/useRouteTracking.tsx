import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationCache } from './useLocalStorage';

// Hook to track user's navigation and save current route
export function useRouteTracking() {
  const location = useLocation();
  const { saveRoute } = useNavigationCache();

  useEffect(() => {
    // Save current route with timestamp
    const routeData = {
      path: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    try {
      localStorage.setItem('dalalati-current-session', JSON.stringify(routeData));
      saveRoute(location.pathname + location.search);
    } catch (error) {
      console.error('Error saving route:', error);
    }
  }, [location, saveRoute]);

  // Function to get last session data
  const getLastSession = () => {
    try {
      const sessionData = localStorage.getItem('dalalati-current-session');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting last session:', error);
      return null;
    }
  };

  // Function to restore last session
  const shouldRestoreSession = () => {
    const lastSession = getLastSession();
    if (!lastSession) return false;

    const sessionTime = new Date(lastSession.timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - sessionTime.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // Restore session if it was less than 24 hours ago
    return hoursDiff < 24;
  };

  return { getLastSession, shouldRestoreSession };
}