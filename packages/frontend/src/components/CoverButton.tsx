import React, { FC } from 'react';
import { cs } from '@/utils/helpers';

interface CoverButtonProps {
  children: React.ReactNode;
  button: React.ReactNode;
}

const CoverButton: FC<CoverButtonProps> = ({ children, button }) => {
  return (
    <div className="bg-slate-300 dark:bg-slate-800 rounded-lg overflow-hidden relative">
      {children}
      <div
        className={cs(
          'w-full h-full dark:bg-slate-800 bg-slate-500 absolute top-0 flex items-center justify-center',
          'opacity-0 hover:opacity-50 transition-opacity',
        )}
      >
        {button}
      </div>
    </div>
  );
};

export default CoverButton;
