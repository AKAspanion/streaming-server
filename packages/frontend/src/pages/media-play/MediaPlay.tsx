import Hls from 'hls.js';
import { baseUrl } from '@config/api';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import LazyHeader from '@components/LazyHeader';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import { usePlayMediaByIdQuery } from '@services/media';
import usePollingEffect from '@/hooks/usePolling';
import useMediaMutation from '@/hooks/useMediaMutation';
import './MediaPlay.css';

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { mediaId = '' } = useParams();
  const [searchParams] = useSearchParams();

  const { updateMediaStatus } = useMediaMutation();
  const { data: mediaData, isFetching, status } = usePlayMediaByIdQuery(mediaId);

  usePollingEffect(async () => {
    if (ref.current && mediaData?.data?.id) {
      await updateMediaStatus({
        id: mediaData?.data?.id,
        paused: ref.current?.paused,
        currentTime: ref.current?.currentTime,
      });
    }
  }, [mediaData?.data?.id]);

  const handleSourceLoad = (videoResult: { data: MediaTypeFull }) => {
    try {
      const videoRef = ref.current;
      if (videoRef && videoResult?.data) {
        let currentTime = 0;
        const resume = searchParams.get('resume');

        if (resume) {
          currentTime = Number(resume);
        }

        const videoSrc = `${baseUrl}${videoResult.data.src}`;
        if (Hls.isSupported()) {
          const hls = new Hls();

          hls.loadSource(videoSrc);
          hls.attachMedia(videoRef);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.play();
            videoRef.currentTime = currentTime;
          });
        } else if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.src = videoSrc;
          videoRef.addEventListener('loadedmetadata', () => {
            videoRef.play();
            videoRef.currentTime = currentTime;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, mediaData]);

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      {loading && <Spinner full />}
      <div className="bg-black h-screen">
        <LazyHeader backTo="/manage-media" name={mediaData?.data?.originalName} />
        <video autoPlay controls ref={ref} id="myVideo" />
      </div>
    </div>
  );
}

export default VIdeoPlay;
