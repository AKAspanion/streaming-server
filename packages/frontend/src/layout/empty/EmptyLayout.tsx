import { FC } from 'react';
import { Outlet } from 'react-router-dom';

const Empty: FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default Empty;
