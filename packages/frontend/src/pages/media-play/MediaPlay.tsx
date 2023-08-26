import { baseUrl } from '@config/api';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMemo, useRef } from 'react';
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

  const resume = searchParams.get('resume') || '0';
  const folderId = searchParams.get('folderId') || '';
  const back = searchParams.get('back') || '/';

  const { updateMediaStatus, stopMedia } = useMediaMutation();
  const { data: mediaList } = useGetMediaInFolderQuery(folderId || '');
  const { data: mediaData, isFetching, status } = usePlayMediaByIdQuery(mediaId);
  const { data: subData, isLoading: subLoading } = useGetMediaSubtitleByIdQuery(mediaId);

  const stopVideo = () => mediaData?.data?.id && stopMedia(mediaData?.data?.id);

  const nextLink = useMemo(() => {
    let path = '';
    if (folderId && mediaList?.data && mediaList?.data.length) {
      const index = mediaList?.data?.findIndex((m) => m.id === mediaData?.data?.id);
      if (index > -1 && mediaList?.data[index + 1]) {
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

  const backTo = folderId ? `/manage-media/${folderId}/folder` : back;

  return (
    <div className="fixed z-20 w-screen h-screen top-0 left-0">
      {loading && <Spinner full large />}
      <div className="bg-black h-screen">
        {videoSrc ? (
          <HLSPlayer
            ref={ref}
            src={videoSrc}
            backTo={backTo}
            nextLink={nextLink}
            subtitlesText={subData}
            currentTime={currentTime}
            name={normalizeText(mediaData?.data?.originalName)}
            thumbnailSrc={`${baseUrl}/media/${mediaData?.data?.id}/thumbnail/seek`}
            onNext={() => stopVideo()}
            onUnmount={() => stopVideo()}
            onEnded={() => {
              navigate(backTo);
              stopVideo();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default MediaPlay;
