import { Outlet, useMatches } from 'react-router-dom';
import Header from './Header';
import Breadcrumbs from '@components/Breadcrumbs';
import Sidebar from './Sidebar';
import { useAppSelector } from '@/store/hook';
import { cs } from '@/utils/helpers';
import { useMemo } from 'react';

function HomeLayout() {
  const matches = useMatches();

  const currentRoute = useMemo(() => {
    const nMatches = matches || [];

    return nMatches.length > 0 ? nMatches[nMatches.length - 1] : undefined;
  }, [matches]);

  const sidebarOpen = useAppSelector((s) => s?.globalData?.sidebarOpen);

  const isFull = currentRoute && (currentRoute?.handle as RouterHandler)?.full;

  return (
    <div className="relative">
      {isFull ? (
        <Outlet />
      ) : (
        <>
          <Header title="Video Streaming Server" />
          <div className="flex relative">
            <div
              className={cs(
                { '-left-0': sidebarOpen },
                { '-left-20': !sidebarOpen },
                'z-10 w-[var(--sidebar-width)] h-[var(--sidebar-height)] absolute  sm:static overflow-auto',
              )}
            >
              <Sidebar />
            </div>
            <div className="">
              <Breadcrumbs />
              <div className="w-screen sm:w-[var(--content-width)]  h-[var(--content-height)] relative overflow-y-auto">
                <Outlet />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HomeLayout;
