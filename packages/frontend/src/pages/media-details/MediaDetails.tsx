import { FC } from 'react';
import { useParams } from 'react-router-dom';

interface MediaDetailsProps {}

const MediaDetails: FC<MediaDetailsProps> = () => {
  const { mediaId = '' } = useParams();
  return <div>{mediaId}</div>;
};

export default MediaDetails;
