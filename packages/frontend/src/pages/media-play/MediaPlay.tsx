import { baseUrl } from '@config/api';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import { useGetMediaSubtitleByIdQuery, usePlayMediaByIdQuery } from '@services/media';
import usePollingEffect from '@/hooks/usePolling';
import useMediaMutation from '@/hooks/useMediaMutation';
import { HLSPlayer } from '@/components/hls-player/HLSPlayer';
import { normalizeText } from '@common/utils/validate';
import { useGetMediaInFolderQuery } from '@/services/folder';

function MediaPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { mediaId = '' } = useParams();
  const [searchParams] = useSearchParams();

  const resume = searchParams.get('resume');
  const folderId = searchParams.get('back');

  const { updateMediaStatus, stopMedia } = useMediaMutation();
  const { data: mediaList } = useGetMediaInFolderQuery(folderId || '');
  const { data: mediaData, isFetching, status } = usePlayMediaByIdQuery(mediaId);
  const { data: subData, isLoading: subLoading } = useGetMediaSubtitleByIdQuery(mediaId);

  const nextLink = useMemo(() => {
    let path = '';
    if (folderId && mediaList?.data && mediaList?.data.length) {
      const index = mediaList?.data?.findIndex((m) => m.id === mediaData?.data?.id);
      if (index && index > -1 && mediaList?.data[index + 1]) {
        const nextId = mediaList?.data[index + 1].id;
        path = `/media-play/${nextId}?back=${folderId}`;
      }
      return path;
    }

    return path;
  }, [folderId, mediaData?.data?.id, mediaList]);

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
        if (mediaData?.data?.subs) {
          track.label = normalizeText(
            mediaData?.data?.subs[mediaData?.data?.selectedSubtitle || 0]?.name,
          );
        }
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

  if (resume) {
    currentTime = Number(resume);
  }

  useEffect(() => {
    if (!loading && subData) {
      handleSubtitleLoad(subData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, subData]);

  const backTo = folderId ? `/manage-media/${folderId}/folder` : '/manage-media';

  return (
    <div className="fixed z-20 w-screen h-screen top-0 left-0">
      {loading && <Spinner full />}
      <div className="bg-black h-screen">
        {videoSrc ? (
          <HLSPlayer
            ref={ref}
            src={videoSrc}
            backTo={backTo}
            nextLink={nextLink}
            currentTime={currentTime}
            name={normalizeText(mediaData?.data?.originalName)}
            thumbnailSrc={`${baseUrl}/media/${mediaData?.data?.id}/thumbnail/seek`}
            onUnmount={() => mediaData?.data?.id && stopMedia(mediaData?.data?.id)}
            onEnded={() => {
              navigate(backTo);
              mediaData?.data?.id && stopMedia(mediaData?.data?.id);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default MediaPlay;
