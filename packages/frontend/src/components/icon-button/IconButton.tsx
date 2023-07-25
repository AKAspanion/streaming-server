import { FC } from 'react';

interface IconButtonProps {
  onClick?: () => void;
  children: React.ReactElement;
}

const IconButton: FC<IconButtonProps> = ({ children, onClick }) => {
  return (
    <div
      className="p-2 dark:hover:bg-slate-700 rounded-full dark:bg-slate-800 bg-slate-200 hover:bg-slate-100 cursor-pointer"
      onClick={onClick}
    >
      <div className="w-4">{children}</div>
    </div>
  );
};

export default IconButton;
