import { useEffect } from 'react';
import { FC, useState } from 'react';
import Spinner from './atoms/spinner/Spinner';
import { cs } from '@/utils/helpers';

interface LazyImageProps {
  src?: string;
  className?: string;
}

const LazyImage: FC<LazyImageProps> = ({ src, className }) => {
  const [loading, setLoading] = useState(true);

  const LazyImageLoaded = () => {
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
  }, [src]);

  return (
    <div className="w-full flex items-center justify-center relative transition-all">
      <img
        src={src}
        className={cs(className, { 'opacity-0': loading })}
        onLoad={LazyImageLoaded}
      ></img>
      {loading && (
        <div
          className={cs('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', {
            'opacity-0': !loading,
          })}
        >
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default LazyImage;
