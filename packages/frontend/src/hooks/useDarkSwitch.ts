import { useEffect, useCallback, useState } from 'react';

const storageTheme: string = localStorage?.theme === 'dark' ? 'dark' : 'light';

const useDarkSwitch = () => {
  const [theme, setTheme] = useState<string>(storageTheme);

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
