import { Outlet } from 'react-router-dom';
import Header from './Header';
import Breadcrumbs from '@components/Breadcrumbs';
import Sidebar from './Sidebar';
import { useAppSelector } from '@/store/hook';
import { cs } from '@/utils/helpers';

function Home() {
  const sidebarOpen = useAppSelector((s) => s?.globalData?.sidebarOpen);
  return (
    <div>
      <Header title="Video Streaming Server" />
      <div className="flex relative">
        <div
          className={cs(
            { '-left-0': sidebarOpen },
            { '-left-20': !sidebarOpen },
            'w-[var(--sidebar-width)] h-[var(--sidebar-height)] absolute  sm:static z-20 overflow-auto',
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
    </div>
  );
}

export default Home;
