import { FC } from 'react';

interface SectionGridProps {
  children: React.ReactNode;
}

const SectionGrid: FC<SectionGridProps> = ({ children }) => {
  return (
    <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 pt-4">
      {children}
    </div>
  );
};

export default SectionGrid;
