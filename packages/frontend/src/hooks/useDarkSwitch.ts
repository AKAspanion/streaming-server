import { useEffect, useCallback, useState } from 'react';

const getStorageTheme = () => (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

const useDarkSwitch = () => {
  const [theme, setTheme] = useState<string>(getStorageTheme());

  const switchTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    } catch (error) {
      //
    }
  }, [theme]);

  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches &&
      !getStorageTheme()
    ) {
      setTheme('dark');
    }

    const toggle = (e: MediaQueryListEvent) => {
      const colorScheme = e.matches ? 'dark' : 'light';
      setTheme(colorScheme);
    };

    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', toggle);

    return () => {
      return (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', toggle)
      );
    };
  }, []);

  return { theme, isDark: theme === 'dark', switchTheme };
};

export default useDarkSwitch;
