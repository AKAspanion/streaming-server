import useDarkSwitch from '@hooks/useDarkSwitch';
import React from 'react';
import { MinusIcon, MoonIcon, SunIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Button from './button/Button';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ipcRenderer = require('electron').ipcRenderer;

import './Header.css';

type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { isDark, switchTheme } = useDarkSwitch();

  const closeApp = () => {
    ipcRenderer.send('close-app');
  };

  const minimize = () => {
    ipcRenderer.send('minimize');
  };

  return (
    <div className=" flex justify-between items-center w-screen bg-slate-300 dark:bg-slate-800">
      <div className="w-20"></div>
      <h1 className="header-text p-2 text-md font-semibold flex-1 text-center">{title}</h1>
      <div className="pr-4 flex">
        <Button onClick={switchTheme}>
          <div className="w-4">{isDark ? <SunIcon /> : <MoonIcon />}</div>
        </Button>
        <Button onClick={minimize}>
          <div className="w-4">{<MinusIcon />}</div>
        </Button>
        <Button onClick={closeApp}>
          <div className="w-4">{<XMarkIcon />}</div>
        </Button>
      </div>
    </div>
  );
};

export default Header;
