import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Hook to track user's navigation and save current route
export function useRouteTracking() {
  const location = useLocation();

  const saveRoute = useCallback((route: string) => {
    try {
      const storedHistory = localStorage.getItem('dalalati-nav-history');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      const newHistory = [route, ...history.filter((r: string) => r !== route)].slice(0, 10);
      
      localStorage.setItem('dalalati-last-route', route);
      localStorage.setItem('dalalati-nav-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving route:', error);
    }
  }, []);

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
  }, [location.pathname, location.search, saveRoute]);

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