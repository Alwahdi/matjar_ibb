import { useState, useEffect } from 'react';

// Generic hook for localStorage with fallback
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook for theme persistence
export function useThemeCache() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('dalalati-theme', 'light');

  useEffect(() => {
    // Apply theme on mount and when theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}

// Hook for navigation cache
export function useNavigationCache() {
  // Use direct localStorage access for simple strings to avoid JSON parsing issues
  const [lastRoute, setLastRoute] = useState<string>(() => {
    try {
      return localStorage.getItem('dalalati-last-route') || '/';
    } catch (error) {
      return '/';
    }
  });
  const [navigationHistory, setNavigationHistory] = useLocalStorage<string[]>('dalalati-nav-history', []);

  const saveRoute = (route: string) => {
    setLastRoute(route);
    localStorage.setItem('dalalati-last-route', route);
    setNavigationHistory(prev => {
      const newHistory = [route, ...prev.filter(r => r !== route)].slice(0, 10); // Keep last 10 routes
      return newHistory;
    });
  };

  const clearHistory = () => {
    setNavigationHistory([]);
  };

  return { lastRoute, navigationHistory, saveRoute, clearHistory };
}

// Hook for search preferences cache
export function useSearchCache() {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('dalalati-recent-searches', []);
  const [searchFilters, setSearchFilters] = useLocalStorage('dalalati-search-filters', {
    category: 'all',
    city: 'all',
    listingType: 'all',
    minPrice: '',
    maxPrice: ''
  });

  const addRecentSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      setRecentSearches(prev => {
        const newSearches = [searchTerm, ...prev.filter(s => s !== searchTerm)].slice(0, 5);
        return newSearches;
      });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const saveSearchFilters = (filters: any) => {
    setSearchFilters(filters);
  };

  return { recentSearches, searchFilters, addRecentSearch, clearRecentSearches, saveSearchFilters };
}

// Hook for user preferences cache
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('dalalati-user-preferences', {
    language: 'ar',
    currency: 'SAR',
    showOnboarding: true,
    gridView: true,
    notificationsEnabled: true,
    autoSaveSearch: true,
    compactMode: false
  });

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPreferences = () => {
    setPreferences({
      language: 'ar',
      currency: 'SAR',
      showOnboarding: true,
      gridView: true,
      notificationsEnabled: true,
      autoSaveSearch: true,
      compactMode: false
    });
  };

  return { preferences, updatePreference, resetPreferences };
}

// Hook for form data cache (for drafts)
export function useFormCache(formId: string) {
  const [formData, setFormData] = useLocalStorage(`dalalati-form-${formId}`, {});

  const saveFormData = (data: any) => {
    setFormData(data);
  };

  const clearFormData = () => {
    setFormData({});
  };

  return { formData, saveFormData, clearFormData };
}

// Hook for favorites cache (backup)
export function useFavoritesCache() {
  const [cachedFavorites, setCachedFavorites] = useLocalStorage<string[]>('dalalati-cached-favorites', []);

  const addToCache = (propertyId: string) => {
    setCachedFavorites(prev => [...new Set([...prev, propertyId])]);
  };

  const removeFromCache = (propertyId: string) => {
    setCachedFavorites(prev => prev.filter(id => id !== propertyId));
  };

  const syncWithServer = (serverFavorites: string[]) => {
    setCachedFavorites(serverFavorites);
  };

  return { cachedFavorites, addToCache, removeFromCache, syncWithServer };
}