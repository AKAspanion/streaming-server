import { Outlet } from 'react-router-dom';
import Header from './Header';
import Breadcrumbs from '@components/Breadcrumbs';
import Sidebar from './Sidebar';

function Home() {
  return (
    <div>
      <Header title="Video Streaming Server" />
      <div className="flex">
        <div className="w-[var(--sidebar-width)] h-[var(--sidebar-height)] overflow-auto">
          <Sidebar />
        </div>
        <div className="">
          <Breadcrumbs />
          <div className="w-[var(--content-width)]  h-[var(--content-height)] relative overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
