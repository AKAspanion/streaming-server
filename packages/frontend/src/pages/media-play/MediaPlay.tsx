import { baseUrl } from '@config/api';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import { useGetMediaSubtitleByIdQuery, usePlayMediaByIdQuery } from '@services/media';
import usePollingEffect from '@/hooks/usePolling';
import useMediaMutation from '@/hooks/useMediaMutation';
import { HLSPlayer } from '@/components/PlayerHLS';
import { normalizeText } from '@common/utils/validate';

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { mediaId = '' } = useParams();
  const [searchParams] = useSearchParams();

  const { updateMediaStatus, stopMedia } = useMediaMutation();
  const { data: mediaData, isFetching, status } = usePlayMediaByIdQuery(mediaId);
  const { data: subData, isLoading: subLoading } = useGetMediaSubtitleByIdQuery(mediaId);

  usePollingEffect(async () => {
    if (ref.current && mediaData?.data?.id) {
      await updateMediaStatus({
        id: mediaData?.data?.id,
        paused: ref.current?.paused,
        currentTime: ref.current?.currentTime,
      });
    }
  }, [mediaData?.data?.id]);

  const loading = isFetching || subLoading;

  const handleSubtitleLoad = (trackText: string) => {
    try {
      const videoRef = ref.current;
      if (videoRef && trackText) {
        const hasTrack = videoRef.getElementsByTagName('track');

        if (hasTrack && hasTrack.length > 0) {
          for (const e of hasTrack) {
            videoRef.removeChild(e);
          }
        }

        const track = document.createElement('track');
        track.src = trackText;
        track.label = normalizeText(mediaData?.data?.sub?.originalname);
        // track.srclang = 'en';
        track.default = true;
        videoRef.appendChild(track);

        videoRef.textTracks[0].mode = 'showing';
      }
    } catch (e) {
      console.error(e);
    }
  };

  useToastStatus(status, {
    errorMessage: 'Failed to fetch video details',
  });

  let videoSrc = '';

  if (mediaData?.data?.src) {
    videoSrc = `${baseUrl}${mediaData.data.src}`;
  }

  let currentTime = 0;
  const resume = searchParams.get('resume');
  const folderId = searchParams.get('back');

  if (resume) {
    currentTime = Number(resume);
  }

  useEffect(() => {
    if (!loading && subData) {
      handleSubtitleLoad(subData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, subData]);

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      {loading && <Spinner full />}
      <div className="bg-black h-screen">
        {videoSrc ? (
          <HLSPlayer
            ref={ref}
            src={videoSrc}
            currentTime={currentTime}
            name={normalizeText(mediaData?.data?.originalName)}
            backTo={folderId ? `/manage-media/${folderId}/folder` : '/manage-media'}
            onUnmount={() => mediaData?.data?.id && stopMedia(mediaData?.data?.id)}
          />
        ) : null}
      </div>
    </div>
  );
}

export default VIdeoPlay;
