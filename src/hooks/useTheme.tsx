import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('dalalati-theme');
    return (stored as Theme) || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      let darkMode = false;
      
      if (theme === 'system') {
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        darkMode = theme === 'dark';
      }
      
      setIsDark(darkMode);
      document.documentElement.classList.toggle('dark', darkMode);
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('dalalati-theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      handleSetTheme('light');
    } else if (theme === 'light') {
      handleSetTheme('dark');
    } else {
      handleSetTheme('light');
    }
  };

  const value = {
    theme,
    isDark,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}