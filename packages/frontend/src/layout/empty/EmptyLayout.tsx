import { FC } from 'react';
import { Outlet } from 'react-router-dom';

const Empty: FC = () => {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
};

export default Empty;
