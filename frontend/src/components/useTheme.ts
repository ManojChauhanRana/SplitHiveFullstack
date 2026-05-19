import { useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';

const getInitial = (): Theme =>
  (localStorage.getItem('theme') as Theme) || 'light';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitial);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-bs-theme', next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return { theme, toggle, setTheme };
}
