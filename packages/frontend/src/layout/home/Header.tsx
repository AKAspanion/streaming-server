import useDarkSwitch from '@hooks/useDarkSwitch';
import React from 'react';
import {
  Bars3BottomLeftIcon,
  MinusIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

import IconButton from '@components/atoms/icon-button/IconButton';
import { cs } from '@utils/helpers';
import './Header.css';
import useIPCRenderer from '@hooks/useIPCRenderer';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { setSidebarOpen } from '@/store/globalSlice';

type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const ipcRenderer = useIPCRenderer();
  const { isDark, switchTheme } = useDarkSwitch();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((s) => s?.globalData?.sidebarOpen);

  const closeApp = () => {
    if (ipcRenderer) ipcRenderer.send('close-app');
  };

  const minimize = () => {
    if (ipcRenderer) ipcRenderer.send('minimize');
  };

  return (
    <div
      className={cs(
        'flex justify-between items-center w-screen bg-slate-200 dark:bg-slate-800',
        'border-slate-300 border-b dark:border-slate-700 h-[var(--header-height)]',
      )}
    >
      <div className={cs('p-2 px-4 font-bold flex flex-1 gap-3 items-center text-left')}>
        <IconButton onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}>
          <Bars3BottomLeftIcon />
        </IconButton>
        <div className="flex flex-1 header-text">
          <div className="line-clamp-1">{title}</div>
        </div>
      </div>
      <div className="flex gap-1 px-2">
        <IconButton onClick={switchTheme}>
          <div className="w-4">{isDark ? <SunIcon /> : <MoonIcon />}</div>
        </IconButton>
        {ipcRenderer && (
          <IconButton onClick={minimize}>
            <div className="w-4">{<MinusIcon />}</div>
          </IconButton>
        )}
        {ipcRenderer && (
          <IconButton onClick={closeApp}>
            <div className="w-4">{<XMarkIcon />}</div>
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default Header;
