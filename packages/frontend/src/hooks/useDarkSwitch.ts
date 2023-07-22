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
      root.removeAttribute('class');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    } catch (error) {
      //
    }
  }, [theme]);

  return { theme, isDark: theme === 'dark', switchTheme };
};

export default useDarkSwitch;
