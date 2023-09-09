import React, { useState } from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const Image: React.FC<ImageProps> = (props) => {
  const { fallback = '/fallback.svg', src, className, ...rest } = props;

  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const onError = () => setImgSrc(fallback);

  return <img src={imgSrc ? imgSrc : fallback} className={className} onError={onError} {...rest} />;
};

export default Image;
