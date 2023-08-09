import React, { FC } from 'react';
import { cs } from '@/utils/helpers';

interface CoverButtonProps {
  children: React.ReactNode;
  button: React.ReactNode;
}

const CoverButton: FC<CoverButtonProps> = ({ children, button }) => {
  return (
    <div className="bg-slate-300 dark:bg-slate-800 rounded-lg overflow-hidden relative">
      <div
        className={cs(
          'w-full h-full absolute z-10 top-0 flex items-center justify-center',
          'opacity-100',
        )}
      >
        {button}
      </div>
      {children}
    </div>
  );
};

export default CoverButton;
