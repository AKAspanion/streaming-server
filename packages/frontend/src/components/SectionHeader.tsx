import { FC } from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({ title, description, className }) => {
  return (
    <div className={className}>
      <div className="text-xl font-semibold">{title}</div>
      {description && <div className="text-sm opacity-60">{description}</div>}
    </div>
  );
};

export default SectionHeader;
