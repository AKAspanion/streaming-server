import Hls from 'hls.js';
import { baseUrl } from '@config/api';
import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import LazyHeader from '@components/LazyHeader';
// import { useGetSubtitleByIdQuery } from '@services/subtitle';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import { useGetMediaByIdQuery } from '@services/media';
import './MediaPlay.css';

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { mediaId = '' } = useParams();

  const { data: mediaData, isFetching, status } = useGetMediaByIdQuery(mediaId);

  const handleSourceLoad = (videoResult: { data: MediaTypeFull }) => {
    try {
      const videoRef = ref.current;
      if (videoRef && videoResult?.data) {
        const videoSrc = `${baseUrl}${videoResult.data.src}`;
        if (Hls.isSupported()) {
          const hls = new Hls();

          hls.loadSource(videoSrc);
          hls.attachMedia(videoRef);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.play();
          });
        } else if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.src = videoSrc;
          videoRef.addEventListener('loadedmetadata', () => {
            videoRef.play();
          });
        }
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
    if (!loading && mediaData) {
      handleSourceLoad(mediaData);
    }
  }, [loading, mediaData]);

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      {loading && <Spinner full />}
      <div className="bg-black h-screen">
        <LazyHeader name={mediaData?.data?.originalName} />
        <video autoPlay controls ref={ref} id="myVideo" />
      </div>
    </div>
  );
}

export default VIdeoPlay;
