import { getNetworkAPIUrlWithAuth } from '@config/api';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import Spinner from '@components/atoms/spinner/Spinner';
import useToastStatus from '@hooks/useToastStatus';
import {
  useGetMediaSubtitleByIdQuery,
  usePlayMediaByIdQuery,
  useSetMediaAudioMutation,
  useSetMediaSubtitleMutation,
} from '@services/media';
import usePollingEffect from '@/hooks/usePolling';
import useMediaMutation from '@/hooks/useMediaMutation';
import { HLSPlayer } from '@/components/hls-player/HLSPlayer';
import { normalizeText } from '@common/utils/validate';
import { useGetMediaInFolderQuery } from '@/services/folder';
import toast from 'react-hot-toast/headless';

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
  const [updateAudio, { isLoading: isAudioUpdating }] = useSetMediaAudioMutation();
  const [updateSubtitle, { isLoading: subUpdateLoading }] = useSetMediaSubtitleMutation();

  const getCurrentUrl = () => {
    return `/media-play/${mediaId || ''}?resume=${
      ref?.current?.currentTime || 0
    }&back=${back}&folderId=${folderId}`;
  };

  const stopVideo = () => {
    mediaData?.data?.id && stopMedia(mediaData?.data?.id);
  };

  const handleExit = () => {
    navigate(getCurrentUrl());
    stopVideo();
  };

  const handleAudioChange = async (v: string) => {
    try {
      const index = (mediaData?.data?.audioStreams || []).findIndex((s) => {
        return s?.index == v;
      });

      if (index == -1) {
        throw new Error('no audio found');
      }

      if (!isAudioUpdating) {
        await updateAudio({ id: mediaId, index: v }).unwrap();
        handleReload();
      }
    } catch (error) {
      toast.error("Coudn't load audio");
    }
  };

  const handleSubtitleChange = async (subId: string) => {
    try {
      const index = (mediaData?.data?.subs || []).findIndex((s) => {
        return s?.id === subId;
      });

      if (index == -1) {
        throw new Error('no sub found');
      }

      if (!subUpdateLoading) {
        await updateSubtitle({ id: mediaId, index }).unwrap();
        handleReload();
      }
    } catch (error) {
      toast.error("Coudn't load subtitle");
    }
  };

  const handleReload = () => {
    handleExit();
    window.location.reload();
  };

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
        watched: false,
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
    videoSrc = getNetworkAPIUrlWithAuth(mediaData.data.src);
  }

  let currentTime = 0;

  if (resume) {
    currentTime = Number(resume);

    if (mediaData?.data?.watched) {
      currentTime = 0;
    }
  }

  const backTo = folderId ? `/manage-media/${folderId}/folder` : back;

  useEffect(() => {
    const terminationEvent = 'onpagehide' in self ? 'pagehide' : 'unload';

    const onLeave = () => {
      handleExit();
    };

    addEventListener(terminationEvent, onLeave, false);

    return () => {
      removeEventListener(terminationEvent, onLeave, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, subData]);

  return (
    <div className="fixed z-20 w-screen h-screen top-0 left-0">
      {loading && <Spinner full large />}
      <div className="bg-black h-screen">
        {videoSrc ? (
          <HLSPlayer
            reload
            ref={ref}
            src={videoSrc}
            backTo={backTo}
            nextLink={nextLink}
            subtitlesText={subData}
            currentTime={currentTime}
            subs={mediaData?.data?.subs}
            audios={mediaData?.data?.audioStreams}
            selectedAudio={mediaData?.data?.selectedAudio}
            selectedSubtitle={mediaData?.data?.selectedSubtitle}
            name={normalizeText(mediaData?.data?.originalName)}
            thumbnailSrc={`/media/${mediaData?.data?.id}/thumbnail/seek`}
            onNext={() => stopVideo()}
            onUnmount={() => stopVideo()}
            onReload={() => handleReload()}
            onAudioChange={(v) => handleAudioChange(v)}
            onSubtitleChange={(v) => handleSubtitleChange(v)}
            onEnded={async () => {
              if (mediaData?.data?.id && ref.current) {
                await updateMediaStatus({
                  watched: true,
                  id: mediaData?.data?.id,
                  paused: ref.current?.paused,
                  currentTime: ref.current?.currentTime,
                });
              }
              navigate(backTo);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default MediaPlay;
