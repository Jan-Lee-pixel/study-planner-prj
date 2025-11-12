import { useEffect, useState } from 'react';

const THEME_KEY = 'study-planner-theme';
const DEFAULT_THEME = 'light';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    return window.localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}
