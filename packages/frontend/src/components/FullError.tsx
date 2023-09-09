import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

interface FullErrorProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const FullError: FC<FullErrorProps> = ({
  icon,
  title = 'OOPS!',
  description = 'Something went wrong!',
}) => {
  return (
    <div className="p-8 w-full h-full relative">
      <div className="">
        <div className="text-3xl font-bold pb-1">{title}</div>
        <div className="text-lg opacity-70">{description}</div>
      </div>
      <div className="mt-3">
        <Link to="/">
          <Button variant={'outline'}>Home</Button>
        </Link>
      </div>
      <div className="w-96 opacity-5 absolute right-16 bottom-8">
        {icon ? icon : <ExclamationTriangleIcon />}
      </div>
    </div>
  );
};

export default FullError;
