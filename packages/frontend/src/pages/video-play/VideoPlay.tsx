import { useGetVideoByIdQuery, useGetVideoSubtitleByIdQuery } from '@services/video';
import { baseUrl } from '@config/api';
import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import LazyHeader from '@components/LazyHeader';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import { HLSPLayer } from '@/components/HLSPLayer';

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { videoId = '' } = useParams();

  const { data: videoData, isFetching, status } = useGetVideoByIdQuery(videoId);
  const { data: subData, isLoading: subLoading } = useGetVideoSubtitleByIdQuery(videoId);

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
    src = `${baseUrl}/video/stream/${videoData?.data?.id}`;
  }

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      {loading && <Spinner full />}
      <div className="bg-black h-screen">
        <LazyHeader backTo="/video-upload" name={videoData?.data?.originalname} />
        <HLSPLayer ref={ref} hls={false} src={src} />
      </div>
    </div>
  );
}

export default VIdeoPlay;
