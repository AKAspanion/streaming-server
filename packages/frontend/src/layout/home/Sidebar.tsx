import Image from '@/components/atoms/image/Image';
import { cs } from '@/utils/helpers';
import { normalizeText } from '@common/utils/validate';
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
    document.documentElement.style.setProperty(
      '--sidebar-width',
      flag ? 'var(--sidebar-width-value)' : 'var(--sidebar-width-value-collapsed)',
    );
  }, [sidebarOpen]);

  const renderRoute = (route: RouteObject, level = 0): React.ReactElement => {
    const canShow = route?.handle?.name && !route?.handle?.hide;
    return (
      <div key={`${level}+${normalizeText(route.path)}`}>
        {canShow && (
          <NavLink to={route.path || '/'}>
            {({ isActive }) => (
              <div
                className={classNames('flex items-center cursor-pointer rounded-lg p-3', {
                  'dark:bg-slate-700 bg-slate-800 bg-opacity-10': isActive,
                  'dark:hover:bg-slate-600 hover:bg-slate-100': !isActive,
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
              </div>
            )}
          </NavLink>
        )}
        {route?.children && <div>{route?.children.map((r) => renderRoute(r, level + 1))}</div>}
        {canShow && level === 1 && <div className=" my-1" />}
      </div>
    );
  };

  return (
    <div
      className={cs(
        { 'translate-x-0 sm:translate-x-0': sidebarOpen },
        { '-translate-x-20 sm:translate-x-0': !sidebarOpen },
        'transition-all',
        'bg-slate-200 select-none dark:bg-slate-800 border-r dark:border-slate-700 border-slate-300 h-full p-3',
      )}
    >
      <div className={classNames('flex items-center justify-between mb-4 ml-1.5 w-10', {})}>
        <div className="w-8 h-8 p-1 rounded dark:bg-slate-500 bg-slate-50">
          <Image src="./logo.png" />
        </div>
        <div className="fixed left-5 bottom-3 sm:block">
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
