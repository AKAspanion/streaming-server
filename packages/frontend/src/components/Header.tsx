import useDarkSwitch from '@hooks/useDarkSwitch';
import React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import Button from './button/Button';

type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { isDark, switchTheme } = useDarkSwitch();
  return (
    <div className="flex justify-between items-center w-screen bg-slate-300 dark:bg-slate-800">
      <h1 className="p-4 text-md font-bold">{title}</h1>
      <div className="pr-4">
        <Button onClick={switchTheme}>
          <div className="w-4">{isDark ? <SunIcon /> : <MoonIcon />}</div>
        </Button>
      </div>
    </div>
  );
};

export default Header;
