import { baseUrl } from '@config/api';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRef } from 'react';
import LazyHeader from '@components/LazyHeader';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import { usePlayMediaByIdQuery } from '@services/media';
import usePollingEffect from '@/hooks/usePolling';
import useMediaMutation from '@/hooks/useMediaMutation';
import { HLSPLayer } from '@/components/HLSPLayer';

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

  const loading = isFetching;

  useToastStatus(status, {
    errorMessage: 'Failed to fetch video details',
  });

  let videoSrc = '';

  if (mediaData?.data?.src) {
    videoSrc = `${baseUrl}${mediaData.data.src}`;
  }

  let currentTime = 0;
  const resume = searchParams.get('resume');

  if (resume) {
    currentTime = Number(resume);
  }

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      {loading && <Spinner full />}
      <div className="bg-black h-screen">
        <LazyHeader backTo="/manage-media" name={mediaData?.data?.originalName} />
        {videoSrc ? (
          <HLSPLayer
            ref={ref}
            src={videoSrc}
            currentTime={currentTime}
            onUnmount={() => console.log('Unmount' + new Date().getTime())}
          />
        ) : null}
      </div>
    </div>
  );
}

export default VIdeoPlay;
