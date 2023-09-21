import { useGetVideoByIdQuery, useGetVideoSubtitleByIdQuery } from '@services/video';
import { getNetworkAPIUrlWithAuth } from '@config/api';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import { HLSPlayer } from '@/components/hls-player/HLSPlayer';
import { normalizeText } from '@common/utils/validate';

function VideoPlay() {
  const navigate = useNavigate();
  const ref = useRef<HTMLVideoElement>(null);
  const { videoId = '' } = useParams();
  const [searchParams] = useSearchParams();

  const back = searchParams.get('back') || '/video-upload';

  const { data: videoData, isFetching, status } = useGetVideoByIdQuery(videoId);
  const { data: subData, isLoading: subLoading } = useGetVideoSubtitleByIdQuery(videoId);

  const handleReload = () => {
    window.location.reload();
  };

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
        track.label = 'English';
        track.srclang = 'en';
        track.default = true;
        videoRef.appendChild(track);

        videoRef.textTracks[0].mode = 'showing';
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loading = isFetching || subLoading;

  useToastStatus(status, {
    errorMessage: 'Failed to fetch video details',
  });

  useEffect(() => {
    if (!loading && subData) {
      handleSubtitleLoad(subData);
    }
  }, [loading, subData]);

  let src = '';

  if (videoData?.data?.id) {
    src = getNetworkAPIUrlWithAuth(`/video/stream/${videoData?.data?.id}`);
  }

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      {loading && (
        <div className="w-screen h-screen">
          <Spinner full />
        </div>
      )}
      <HLSPlayer
        reload
        ref={ref}
        src={src}
        hls={false}
        backTo={back}
        thumbnailSrc={`${getNetworkAPIUrlWithAuth()}/video/${videoData?.data?.id}/thumbnail/seek`}
        name={normalizeText(videoData?.data?.originalname)}
        onReload={handleReload}
        onEnded={() => navigate(back)}
      />
    </div>
  );
}

export default VideoPlay;
