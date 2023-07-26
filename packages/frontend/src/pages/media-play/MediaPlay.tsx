import { baseUrl } from '@config/api';
import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import LazyHeader from '@components/LazyHeader';
// import { useGetSubtitleByIdQuery } from '@services/subtitle';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import './MediaPlay.css';
import { useGetMediaByIdQuery } from '@services/media';

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { mediaId = '' } = useParams();

  const { data: videoData, isFetching, status } = useGetMediaByIdQuery(mediaId);

  const handleSourceLoad = (videoResult: { data: MediaTypeFull }) => {
    try {
      const videoRef = ref.current;
      if (videoRef && videoResult?.data) {
        videoRef.onerror = () => {
          console.log('error');
        };
        const hasSource = videoRef.getElementsByTagName('source');

        if (hasSource && hasSource.length > 0) {
          for (const e of hasSource) {
            videoRef.removeChild(e);
          }
        }

        const source = document.createElement('source');
        source.src = `${baseUrl}/media/${videoResult?.data?.id}/stream`;
        videoRef.appendChild(source);

        console.log('Source added', videoResult);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loading = isFetching;

  useToastStatus(status, {
    errorMessage: 'Failed to fetch video details',
  });

  useEffect(() => {
    if (!loading && videoData) {
      handleSourceLoad(videoData);
    }
  }, [loading, videoData]);

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      {loading && <Spinner full />}
      <div className="bg-black h-screen">
        <LazyHeader name={videoData?.data?.originalName} />
        <video autoPlay controls ref={ref} id="myVideo" />
      </div>
    </div>
  );
}

export default VIdeoPlay;
