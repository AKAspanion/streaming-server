import useDarkSwitch from '@hooks/useDarkSwitch';
import React from 'react';
import { MinusIcon, MoonIcon, SunIcon, XMarkIcon } from '@heroicons/react/24/solid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ipcRenderer = require('electron').ipcRenderer;

import IconButton from '@components/icon-button/IconButton';
import { cs } from '@utils/helpers';
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
    <div
      className={cs(
        'flex justify-between items-center w-screen bg-slate-200 dark:bg-slate-800',
        'border-slate-300 border-b dark:border-slate-700',
      )}
    >
      <div className="w-20"></div>
      <h1 className="header-text p-2 text-sm font-semibold flex-1 text-center">{title}</h1>
      <div className="flex gap-1 px-2">
        <IconButton onClick={switchTheme}>
          <div className="w-4">{isDark ? <SunIcon /> : <MoonIcon />}</div>
        </IconButton>
        <IconButton onClick={minimize}>
          <div className="w-4">{<MinusIcon />}</div>
        </IconButton>
        <IconButton onClick={closeApp}>
          <div className="w-4">{<XMarkIcon />}</div>
        </IconButton>
      </div>
    </div>
  );
};

export default Header;
