import { cs } from '@/utils/helpers';
import { ServerStackIcon } from '@heroicons/react/24/solid';
import { FC } from 'react';

interface NoDataProps {
  title?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}

const NoData: FC<NoDataProps> = ({
  title = 'No data found',
  description = '',
  className,
  icon = <ServerStackIcon />,
}) => {
  return (
    <div className={cs('w-full h-full relative', className)}>
      <div className="">
        <div className="text-3xl font-bold pb-1">{title}</div>
        {description && <div className="text-lg opacity-70">{description}</div>}
      </div>
      <div className="w-96 opacity-5 absolute right-16 bottom-8">{icon}</div>
    </div>
  );
};

export default NoData;
