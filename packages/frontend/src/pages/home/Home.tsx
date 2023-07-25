import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Breadcrumbs from '@components/Breadcrumbs';
import Sidebar from './Sidebar';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/video-details');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div>
      <Header title="Video Streaming Server" />
      <div className="flex">
        <div className="w-[var(--sidebar-width)] h-[var(--sidebar-height)] overflow-auto">
          <Sidebar />
        </div>
        <div className="w-[var(--content-width)]  h-[var(--content-height)]">
          <Breadcrumbs />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Home;
