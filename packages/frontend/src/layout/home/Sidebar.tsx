import IconButton from '@components/atoms/icon-button/IconButton';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';
import { routes } from '@router/router';
import { setSidebarOpen } from '@store/globalSlice';
import { useAppDispatch, useAppSelector } from '@store/hook';
import classNames from 'classnames';
import React, { FC, useEffect } from 'react';
import { NavLink, RouteObject } from 'react-router-dom';

type SidebarProps = {
  // routes: RouteObject[];
};

const Sidebar: FC<SidebarProps> = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((s) => s?.globalData?.sidebarOpen);

  useEffect(() => {
    const flag = !!sidebarOpen;
    document.documentElement.style.setProperty('--sidebar-width', flag ? '220px' : '64px');
  }, [sidebarOpen]);

  const renderRoute = (route: RouteObject, level = 0): React.ReactElement => {
    const canShow = route?.handle?.name && !route?.handle?.hide;
    return (
      <div key={`${level}+${route.path || ''}`} className={classNames()}>
        {canShow && (
          <NavLink to={route.path || '/'}>
            {({ isActive }) => (
              <div
                className={classNames('flex items-center cursor-pointer rounded-lg', {
                  'dark:bg-slate-700 bg-slate-800 bg-opacity-10': isActive,
                  'dark:hover:bg-slate-600 hover:bg-slate-100': !isActive,
                  'px-3 py-2 justify-between': sidebarOpen,
                  'px-3 py-2 justify-center w-10': !sidebarOpen,
                })}
              >
                <div className="flex items-center gap-3">
                  <div className={classNames('w-5')}>
                    {!route?.handle?.icon ? <QuestionMarkCircleIcon /> : route?.handle?.icon}
                  </div>

                  {sidebarOpen && (
                    <div className={classNames('text-sm')}>{route?.handle?.name}</div>
                  )}
                </div>
                {/* {route?.children && (
              <div className="w-4">
                <ChevronDownIcon />
              </div>
            )} */}
              </div>
            )}
          </NavLink>
        )}
        {route?.children && <div>{route?.children.map((r) => renderRoute(r, level + 1))}</div>}
        {canShow && level === 1 && <div className="h-[1px] dark:bg-slate-700 bg-slate-300 my-2" />}
      </div>
    );
  };

  return (
    <div className="bg-slate-200 select-none dark:bg-slate-800 border-r dark:border-slate-700 border-slate-300 h-full p-3">
      <div
        className={classNames('flex items-center justify-between mb-4 ml-1 w-10', {
          'ml-0.5': !sidebarOpen,
          'ml-1': sidebarOpen,
        })}
      >
        <div className="w-8 h-8 p-1 rounded dark:bg-slate-500 bg-slate-50">
          <img src="/logo.png" />
        </div>
        <div className="fixed left-4 bottom-3">
          <IconButton onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}>
            {sidebarOpen ? <ArrowLeftOnRectangleIcon /> : <ArrowRightOnRectangleIcon />}
          </IconButton>
        </div>
      </div>
      {routes.map((r) => renderRoute(r, 0))}
    </div>
  );
};

export default Sidebar;
