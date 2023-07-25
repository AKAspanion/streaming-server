import { useGetVideoByIdQuery } from '@services/video';
import { baseUrl } from '@config/api';
import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import LazyHeader from '@components/LazyHeader';
import { useGetSubtitleByIdQuery } from '@services/subtitle';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import './VideoPlay.css';

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { videoId = '' } = useParams();

  const { data: videoData, isLoading, status } = useGetVideoByIdQuery(videoId);
  const { data: subData, isLoading: subLoading } = useGetSubtitleByIdQuery(videoId);

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

  const handleSourceLoad = (videoResult: { data: VideoType }) => {
    try {
      const videoRef = ref.current;
      if (videoRef && videoResult?.data) {
        const hasSource = videoRef.getElementsByTagName('source');

        if (hasSource && hasSource.length > 0) {
          for (const e of hasSource) {
            videoRef.removeChild(e);
          }
        }

        const source = document.createElement('source');
        source.src = `${baseUrl}/video/stream/${videoResult?.data?.id}`;
        source.type = videoResult?.data?.mimetype;
        videoRef.appendChild(source);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loading = isLoading || subLoading;

  useToastStatus(status, {
    errorMessage: 'Failed to fetch video details',
  });

  useEffect(() => {
    if (!loading && videoData) {
      handleSourceLoad(videoData);
    }
  }, [loading, videoData]);

  useEffect(() => {
    if (!loading && subData) {
      handleSubtitleLoad(subData);
    }
  }, [loading, subData]);

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      {loading && <Spinner full />}
      <div className="bg-black h-screen">
        <LazyHeader name={videoData?.data?.originalname} />
        <video autoPlay controls ref={ref} id="myVideo" />
      </div>
    </div>
  );
}

export default VIdeoPlay;
