import { useCallback, useEffect, useRef, useState } from 'react';
import Hls, { LevelLoadedData } from 'hls.js';
import useVideoControls from './useVideoControls';
import { getNetworkAPIUrlWithAuth } from '@/config/api';

export type HLSPlayerProps = {
  hls?: boolean;
  reload?: boolean;
  loading?: boolean;
  src: string;
  subs?: SubtitleType[];
  audios?: MediaStreamType[];
  selectedAudio?: string;
  selectedSubtitle?: number;
  subtitlesText?: string;
  thumbnailSrc?: string;
  nextLink?: string;
  name: string;
  backTo?: string;
  showHeader?: boolean;
  currentTime?: number;
  children?: React.ReactNode;
  onNext?: () => void;
  onEnded?: () => void;
  onUnmount?: () => void;
  onReload?: () => void;
  onAudioChange?: (id: string) => void;
  onSubtitleChange?: (id: string) => void;
};

let lazyHeaderTimeout: NodeJS.Timeout;
let lazyControlsTimeout: NodeJS.Timeout;
const useHLSPlayer = (
  props: HLSPlayerProps,
  ref: React.RefObject<HTMLVideoElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  progressRef: React.RefObject<HTMLInputElement>,
) => {
  const {
    src,
    loading,
    hls = true,
    thumbnailSrc,
    subtitlesText,
    currentTime = 0,
    onUnmount,
  } = props;

  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [pipVisible, setPipVisible] = useState(true);
  const [playbackRate, setPlaybackRate] = useState('1');
  const [volumeState, setVolumeState] = useState('high');
  const [bufferProgress, setBufferProgress] = useState(0);
  const [elapsedDuration, setElapsedDuration] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [subtitlesVisible, setSubtitlesVisible] = useState(true);

  const hlsObj = useRef<Hls>();

  const updateSubtitlePosition = useCallback(
    (position?: number) =>
      new Promise((resolve) => {
        const video = ref.current;
        if (loading) return;
        if (video) {
          Array.from(video.textTracks).forEach((track) => {
            if (track.mode === 'showing') {
              if (track.cues) {
                for (let i = 0; i < track.cues.length; i++) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cue = track.cues[i] as any;

                  if (position && isNaN(position)) {
                    cue.line = 15;
                  } else {
                    cue.line = position;
                  }
                }
              }
              resolve(true);
            }
          });
        }
        resolve(false);
      }),
    [ref, loading],
  );

  const handleControlsVisibility = useCallback(
    (value: boolean) => {
      setControlsVisible(value);

      if (value) {
        updateSubtitlePosition(10);
      } else {
        updateSubtitlePosition(15);
      }
    },
    [updateSubtitlePosition],
  );

  const lazyControlsHide = useCallback(() => {
    clearTimeout(lazyControlsTimeout);
    lazyControlsTimeout = setTimeout(() => {
      handleControlsVisibility(false);
    }, 5000);
  }, [handleControlsVisibility]);

  const handleSubtitleLoad = useCallback(
    (trackText?: string) => {
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
          track.default = true;
          videoRef.appendChild(track);

          videoRef.textTracks[0].mode = 'showing';

          updateSubtitlePosition(10);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [ref, updateSubtitlePosition],
  );

  const initVideo = useCallback(
    (levelData?: LevelLoadedData) => {
      const video = ref.current;
      if (video) {
        handleControlsVisibility(true);
        lazyControlsHide();
        const videoDuration = Math.round(video.duration);

        if (!isNaN(videoDuration)) {
          setDuration(videoDuration);
        }

        if (levelData?.details?.totalduration && !isNaN(levelData?.details?.totalduration)) {
          setDuration(levelData?.details?.totalduration);
        }

        handleSubtitleLoad(subtitlesText);

        if (!('pictureInPictureEnabled' in document)) {
          setPipVisible(false);
        }
      }
    },
    [handleControlsVisibility, handleSubtitleLoad, lazyControlsHide, ref, subtitlesText],
  );

  const handleHLSLoad = useCallback(() => {
    const videoRef = ref.current;
    if (videoRef && src) {
      if (Hls.isSupported()) {
        hlsObj.current = new Hls({
          // debug: IS_DEV,
          autoStartLoad: true,
          manifestLoadingTimeOut: 30000,
          manifestLoadingRetryDelay: 350,
          levelLoadingTimeOut: 30000,
          levelLoadingRetryDelay: 350,
          fragLoadingTimeOut: 30000,
          fragLoadingRetryDelay: 250,
          startFragPrefetch: true,
          startPosition: currentTime,
          enableWorker: true,
        });

        const hls = hlsObj.current;

        hls.attachMedia(videoRef);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(src);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.play();
            initVideo();
          });
        });
        hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          initVideo(data);
        });
      } else if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.src = src;
        videoRef.addEventListener('loadedmetadata', () => {
          videoRef.play();
          initVideo();
        });
      }
    }
  }, [currentTime, initVideo, ref, src]);

  const handleSourceLoad = useCallback(() => {
    try {
      const videoRef = ref.current;
      if (videoRef && src) {
        const hasSource = videoRef.getElementsByTagName('source');

        if (hasSource && hasSource.length > 0) {
          for (const e of hasSource) {
            videoRef.removeChild(e);
          }
        }

        const source = document.createElement('source');
        source.src = src;
        videoRef.appendChild(source);

        videoRef.addEventListener('loadedmetadata', () => {
          videoRef.play();
          initVideo();
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [initVideo, ref, src]);

  const updateSeekTooltip = useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      if (progressRef.current) {
        const { left, width } = progressRef.current.getBoundingClientRect();
        const totalWidth = Math.floor(width);
        const offsetX = event.clientX - left;
        const skipTo = Math.round((offsetX / totalWidth) * duration);
        setSeekValue(skipTo);
      }
    },
    [duration, progressRef],
  );

  const updatePlaybackRate = useCallback(
    (value: string) => {
      const video = ref.current;
      if (video) {
        video.playbackRate = parseFloat(value);
        setPlaybackRate(value);
        video.play();
      }
    },
    [ref],
  );

  const updateVolume = useCallback(
    (value: number[]) => {
      const video = ref.current;
      if (video) {
        if (video.muted) {
          video.muted = false;
        }

        setVolume(value[0]);
        video.volume = value[0];
      }
    },
    [ref],
  );

  const updateSeekTime = useCallback(
    (multiplier: number) => {
      const video = ref.current;
      if (loading) return;
      if (video) {
        video.currentTime += 10 * multiplier;
      }
    },
    [ref, loading],
  );

  const updateSubtitleOffset = useCallback(
    (multiplier: number) => {
      const video = ref.current;
      if (loading) return;
      if (video) {
        Array.from(video.textTracks).forEach((track) => {
          if (track.mode === 'showing') {
            if (track.cues) {
              for (let i = 0; i < track.cues.length; i++) {
                const cue = track.cues[i];

                const newOffset = subtitleOffset + 0.5 * multiplier;

                setSubtitleOffset(newOffset);

                if (multiplier === -1) {
                  cue.startTime -= 0.5;
                  cue.endTime -= 0.5;
                } else {
                  cue.startTime += 0.5;
                  cue.endTime += 0.5;
                }
              }
            }
            return true;
          }
        });
      }
      return false;
    },
    [ref, subtitleOffset, loading],
  );

  const initPlayer = useCallback(() => {
    if (hls) {
      handleHLSLoad();
    } else {
      handleSourceLoad();
    }
  }, [handleHLSLoad, handleSourceLoad, hls]);

  const togglePlay = useCallback(() => {
    const video = ref.current;
    if (loading) return;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [ref, loading]);

  const toggleMute = useCallback(() => {
    const video = ref.current;

    if (loading) return;
    if (!video) return;

    video.muted = !video.muted;
  }, [ref, loading]);

  const togglePip = useCallback(async () => {
    try {
      const video = ref.current;
      if (loading) return;
      if (pipVisible && video && video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error(error);
    }
  }, [pipVisible, ref, loading]);

  const toggleSubtitle = useCallback(() => {
    const video = ref.current;
    if (video) {
      const hasTrack = video.getElementsByTagName('track');

      if (hasTrack && hasTrack.length > 0) {
        const current = video.textTracks[0].mode;
        const isVisible = current === 'showing';
        setSubtitlesVisible(!isVisible);
        video.textTracks[0].mode = isVisible ? 'hidden' : 'showing';
      }
    }
  }, [ref]);

  const toggleFullScreen = useCallback(() => {
    if (loading) return;
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setMaximized(false);
    } else {
      containerRef.current.requestFullscreen();
      setMaximized(true);
    }
  }, [containerRef, loading]);

  const updateElapsedDuration = useCallback(() => {
    const video = ref.current;
    if (!video) return;

    setWaiting(false);

    setProgress(video.currentTime);
    setElapsedDuration(video.currentTime);
  }, [ref]);

  const onWaiting = useCallback(() => {
    setWaiting(true);
  }, []);

  const onPlay = useCallback(() => {
    setPlaying(true);
  }, []);

  const onPause = useCallback(() => {
    setPlaying(false);
    setWaiting(false);
  }, []);

  const onProgress = useCallback(() => {
    const videoRef = ref.current;
    if (!videoRef) return;
    if (!videoRef.buffered) return;
    const bufferedEnd = videoRef.buffered.end(videoRef.buffered.length - 1);
    const duration = videoRef.duration;

    setBufferProgress((bufferedEnd / duration) * 100);
  }, [ref]);

  const onVolumeChange = useCallback(() => {
    const video = ref.current;
    if (!video) return;

    if (video.muted || video.volume === 0) {
      setVolumeState('mute');
    } else if (video.volume > 0 && video.volume <= 0.5) {
      setVolumeState('low');
    } else {
      setVolumeState('high');
    }
  }, [ref]);

  const seekVideo = useCallback(() => {
    const video = ref.current;

    if (loading) return;
    if (!video) return;

    setProgress(seekValue);
    video.currentTime = seekValue;
  }, [ref, seekValue, loading]);

  const getTooltipLeft = useCallback(() => {
    if (!progressRef.current) return;

    const { width } = progressRef.current.getBoundingClientRect();
    const totalWidth = Math.floor(width);

    const percentage = seekValue / duration;

    const tooltipLeft = Math.round(percentage * totalWidth) - 75;

    return `translate(${!isNaN(tooltipLeft) ? tooltipLeft : 0}px, ${
      thumbnailSrc ? '-198' : '0'
    }px)`;
  }, [duration, progressRef, seekValue, thumbnailSrc]);

  const getThumbnailSrc = useCallback(() => {
    if (isNaN(seekValue)) return;

    const srcNum = Math.round(seekValue / 10) * 10;

    return getNetworkAPIUrlWithAuth(`${thumbnailSrc}?time=${srcNum}`);
  }, [seekValue, thumbnailSrc]);

  const lazyHeaderHide = useCallback(() => {
    clearTimeout(lazyHeaderTimeout);
    lazyHeaderTimeout = setTimeout(() => {
      setHeaderVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    const videoRef = ref.current;

    initPlayer();

    return () => {
      if (hlsObj.current) {
        hlsObj.current.destroy();
      }
      if (videoRef) {
        videoRef.pause();
      }

      onUnmount && onUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      handleControlsVisibility(true);
      lazyControlsHide();

      setHeaderVisible(true);
      lazyHeaderHide();

      if (
        e.clientY <= 8 ||
        e.clientX <= 8 ||
        e.clientX >= window.innerWidth - 8 ||
        e.clientY >= window.innerHeight - 8
      ) {
        handleControlsVisibility(false);
        setHeaderVisible(false);
      }
    };
    const onLeave = () => {
      handleControlsVisibility(false);
      setHeaderVisible(false);
    };
    document.addEventListener('mousemove', onMove, false);
    document.addEventListener('mouseleave', onLeave, false);

    return () => {
      document.removeEventListener('mousemove', onMove, false);
      document.removeEventListener('mouseleave', onLeave, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleSubtitleLoad(subtitlesText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitlesText]);

  useVideoControls(ref, { toggleFullScreen, togglePlay, updateSeekTime, updateVolume });

  return {
    volume,
    duration,
    progress,
    seekValue,
    subtitleOffset,
    waiting,
    playing,
    maximized,
    pipVisible,
    playbackRate,
    volumeState,
    bufferProgress,
    elapsedDuration,
    headerVisible,
    controlsVisible,
    subtitlesVisible,
    togglePlay,
    toggleMute,
    togglePip,
    toggleSubtitle,
    toggleFullScreen,
    setVolume,
    getTooltipLeft,
    getThumbnailSrc,
    updateVolume,
    updateSeekTime,
    updateSeekTooltip,
    updatePlaybackRate,
    updateSubtitleOffset,
    updateElapsedDuration,
    updateSubtitlePosition,
    seekVideo,
    onPlay,
    onPause,
    onWaiting,
    onProgress,
    onVolumeChange,
  };
};

export default useHLSPlayer;
