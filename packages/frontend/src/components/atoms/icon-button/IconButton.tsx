import { cs } from '@utils/helpers';
import { FC } from 'react';

interface IconButtonProps {
  onClick?: () => void;
  children: React.ReactElement;
  className?: string;
  kind?: 'primary' | 'secondary';
}

const IconButton: FC<IconButtonProps> = ({ kind = 'primary', className, children, onClick }) => {
  return (
    <div
      className={cs(
        'p-2 rounded-full cursor-pointer',
        {
          'bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-800':
            kind === 'secondary',
        },
        {
          'bg-white hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-900':
            kind === 'primary',
        },
        className,
      )}
      onClick={onClick}
    >
      <div className="w-4">{children}</div>
    </div>
  );
};

export default IconButton;
