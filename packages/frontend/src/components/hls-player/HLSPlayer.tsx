import { ArrowLeftIcon, MinusIcon, PauseIcon, PlayIcon, PlusIcon } from '@heroicons/react/24/solid';
import Hls, { LevelLoadedData } from 'hls.js';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { secToTime } from '@common/utils/date-time';
import { Progress } from '../ui/progress';
import {
  ChevronsLeft,
  ChevronsRight,
  MaximizeIcon,
  MinimizeIcon,
  PictureInPicture2,
  SettingsIcon,
  SkipForwardIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';
import { cs } from '@/utils/helpers';
import Spinner from '../atoms/spinner/Spinner';
import useVideoControls from './useVideoControls';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { PLAYBACK_SPEEDS } from '@common/constants/app';
import ClosedCaptionIcon from '../icons/ClosedCaptionIcon';
import { Slider } from '../ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import LazyImage from '../LazyImage';
import { IS_DEV } from '@/config/app';

type HLSPlayerProps = {
  hls?: boolean;
  src: string;
  thumbnailSrc?: string;
  nextLink?: string;
  name: string;
  backTo?: string;
  showHeader?: boolean;
  currentTime?: number;
  children?: React.ReactNode;
  onEnded?: () => void;
  onUnmount?: () => void;
};

let lazyHeaderTimeout: NodeJS.Timeout;
let lazyControlsTimeout: NodeJS.Timeout;
// let seekTimeout: NodeJS.Timeout;
export const HLSPlayer = forwardRef<HTMLVideoElement, HLSPlayerProps>((props, outerRef) => {
  const {
    src,
    hls = true,
    currentTime = 0,
    name,
    thumbnailSrc,
    backTo = '/',
    nextLink,
    onEnded,
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

  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const hlsObj = useRef<Hls>();

  useImperativeHandle(outerRef, () => ref.current!);

  const handleHLSLoad = () => {
    const videoRef = ref.current;
    if (videoRef && src) {
      if (Hls.isSupported()) {
        hlsObj.current = new Hls({
          debug: IS_DEV,
          autoStartLoad: true,
          manifestLoadingTimeOut: 60000,
          manifestLoadingRetryDelay: 500,
          levelLoadingTimeOut: 60000,
          levelLoadingRetryDelay: 500,
          fragLoadingTimeOut: 60000,
          fragLoadingRetryDelay: 250,
          startFragPrefetch: true,
          startPosition: currentTime,
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
  };

  const handleSourceLoad = () => {
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
  };

  const initVideo = (levelData?: LevelLoadedData) => {
    const video = ref.current;
    if (video) {
      setControlsVisible(true);
      lazyControlsHide();
      const videoDuration = Math.round(video.duration);

      if (!isNaN(videoDuration)) {
        setDuration(videoDuration);
      }

      if (levelData?.details?.totalduration && !isNaN(levelData?.details?.totalduration)) {
        setDuration(levelData?.details?.totalduration);
      }

      const hasTrack = video.getElementsByTagName('track');

      if (hasTrack && hasTrack.length > 0) {
        setSubtitlesVisible(video.textTracks[0].mode === 'showing');
      } else {
        setSubtitlesVisible(false);
      }

      if (!('pictureInPictureEnabled' in document)) {
        setPipVisible(false);
      }
    }
  };

  const updateSeekTooltip = (event: React.MouseEvent<HTMLInputElement>) => {
    if (progressRef.current) {
      const { left, width } = progressRef.current.getBoundingClientRect();
      const totalWidth = Math.floor(width);
      const offsetX = event.clientX - left;
      const skipTo = Math.round((offsetX / totalWidth) * duration);
      setSeekValue(skipTo);
    }
  };

  const updatePlaybackRate = (value: string) => {
    const video = ref.current;
    if (video) {
      video.playbackRate = parseFloat(value);
      setPlaybackRate(value);
      video.play();
    }
  };

  const updateVolume = (value: number[]) => {
    const video = ref.current;
    if (video) {
      if (video.muted) {
        video.muted = false;
      }

      setVolume(value[0]);
      video.volume = value[0];
    }
  };

  const updateSeekTime = (multiplier: number) => {
    const video = ref.current;
    if (video) {
      video.currentTime += 10 * multiplier;
    }
  };

  const updateSubtitleOffset = (multiplier: number) => {
    const video = ref.current;
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
  };

  const initPlayer = () => {
    if (hls) {
      handleHLSLoad();
    } else {
      handleSourceLoad();
    }
  };

  const togglePlay = () => {
    const video = ref.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = ref.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const togglePip = async () => {
    try {
      const video = ref.current;
      if (pipVisible && video && video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSubtitle = () => {
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
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setMaximized(false);
    } else {
      containerRef.current.requestFullscreen();
      setMaximized(true);
    }
  };

  const updateElapsedDuration = () => {
    const video = ref.current;
    if (!video) return;

    setWaiting(false);

    setProgress(video.currentTime);
    setElapsedDuration(video.currentTime);
  };

  const onWaiting = () => {
    setWaiting(true);
  };

  const onPlay = () => {
    setPlaying(true);
  };

  const onPause = () => {
    setPlaying(false);
    setWaiting(false);
  };

  const onProgress = () => {
    const videoRef = ref.current;
    if (!videoRef) return;
    if (!videoRef.buffered) return;
    const bufferedEnd = videoRef.buffered.end(videoRef.buffered.length - 1);
    const duration = videoRef.duration;

    setBufferProgress((bufferedEnd / duration) * 100);
  };

  const onVolumeChange = () => {
    const video = ref.current;
    if (!video) return;

    if (video.muted || video.volume === 0) {
      setVolumeState('mute');
    } else if (video.volume > 0 && video.volume <= 0.5) {
      setVolumeState('low');
    } else {
      setVolumeState('high');
    }
  };

  const seekVideo = () => {
    const video = ref.current;
    if (!video) return;

    setProgress(seekValue);
    video.currentTime = seekValue;
  };

  const getTooltipLeft = () => {
    if (!progressRef.current) return;

    const { width } = progressRef.current.getBoundingClientRect();
    const totalWidth = Math.floor(width);

    const percentage = seekValue / duration;

    const tooltipLeft = Math.round(percentage * totalWidth) - 75;

    return `translate(${!isNaN(tooltipLeft) ? tooltipLeft : 0}px, ${
      thumbnailSrc ? '-198' : '0'
    }px)`;
  };

  const getThumbnailSrc = () => {
    if (isNaN(seekValue)) return;

    const srcNum = Math.round(seekValue / 10) * 10;

    return `${thumbnailSrc}?time=${srcNum}`;
  };

  const lazyHeaderHide = () => {
    clearTimeout(lazyHeaderTimeout);
    lazyHeaderTimeout = setTimeout(() => {
      setHeaderVisible(false);
    }, 5000);
  };

  const lazyControlsHide = () => {
    clearTimeout(lazyControlsTimeout);
    lazyControlsTimeout = setTimeout(() => {
      setControlsVisible(false);
    }, 5000);
  };

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
      let offset = 500;
      if (containerRef.current) {
        const { height } = containerRef.current.getBoundingClientRect();
        offset = height / 2;
      }

      if (e.clientY < offset) {
        setHeaderVisible(true);
        lazyHeaderHide();
      } else {
        setHeaderVisible(false);
      }

      if (e.clientY > offset) {
        setControlsVisible(true);
        lazyControlsHide();
      } else {
        setControlsVisible(false);
      }
    };
    document.addEventListener('mousemove', onMove, false);

    return () => {
      document.removeEventListener('mousemove', onMove, false);
    };
  }, []);

  useVideoControls(ref, { toggleFullScreen, togglePlay, updateSeekTime, updateVolume });

  return (
    <div ref={containerRef} className="text-white w-full h-full dark bg-black relative">
      <video
        autoPlay
        ref={ref}
        id="myVideo"
        onClick={togglePlay}
        onPlay={onPlay}
        onEnded={onEnded}
        onPause={onPause}
        onWaiting={onWaiting}
        onProgress={onProgress}
        onVolumeChange={onVolumeChange}
        onTimeUpdate={() => updateElapsedDuration()}
      />
      {waiting && (
        <div className="text-white drop-shadow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner large />
        </div>
      )}
      <div
        style={{ opacity: `${controlsVisible ? 1 : 0}` }}
        className={cs(
          'transition-all duration-500 dark',
          'absolute bottom-0 left-0 p-4 bg-gradient-to-b from-transparent to-black w-full',
        )}
      >
        <div className="flex items-center gap-4 justify-between dark">
          <div className="line-clamp-1 text-2xl overflow-hidden overflow-ellipsis whitespace-nowrap p-4 drop-shadow">
            {name}
          </div>
          {nextLink && (
            <div className="w-5 mr-4">
              <Link className="p-2" to={nextLink}>
                <SkipForwardIcon />
              </Link>
            </div>
          )}
        </div>
        <div
          style={{ '--hlsplayer-slider-w': 'calc(100%)' } as React.CSSProperties}
          className="dark w-[var(--hlsplayer-slider-w)] px-4 left-5"
        >
          <div className="w-full h-2 group cursor-pointer" onMouseMove={updateSeekTooltip}>
            <Progress
              className="w-full drop-shadow"
              max={duration}
              value={progress}
              ref={progressRef}
              onClick={seekVideo}
            />
            <Progress
              className="w-full opacity-50 -translate-y-2 pointer-events-none"
              value={bufferProgress}
              max={100}
            />
            <div
              style={{ transform: getTooltipLeft() }}
              className="transition-opacity group-hover:opacity-100 pointer-events-none opacity-0 w-[150px] text-xs py-4 z-20"
            >
              {thumbnailSrc && (
                <LazyImage src={getThumbnailSrc()} className="h-full object-cover drop-shadow" />
              )}
              <div className="text-center pt-2 drop-shadow">{secToTime(seekValue, true)}</div>
            </div>
          </div>
        </div>
        <div className="dark flex justify-between gap-4">
          <div className="text-xs drop-shadow pt-2 px-4">{secToTime(elapsedDuration, true)}</div>
          <div className="text-xs drop-shadow pt-2 px-4 ">
            {[duration]
              .filter(Boolean)
              .map((d) => secToTime(Math.round(d), true))
              .join(' / ')}
          </div>
        </div>
        <div className="dark flex gap-3 justify-between items-center">
          <div className="pl-3.5 flex gap-4 items-center">
            <div className="w-7 scale-[1.2] cursor-pointer" onClick={() => updateSeekTime(-1)}>
              <ChevronsLeft className="w-7" />
            </div>
            <div className="p-4 cursor-pointer" onClick={togglePlay}>
              <div className="w-7 ml-0.5">{playing ? <PauseIcon /> : <PlayIcon />}</div>
            </div>
            <div className="w-7 scale-[1.2] cursor-pointer" onClick={() => updateSeekTime(1)}>
              <ChevronsRight className="w-7" />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <HoverCard openDelay={0}>
                <HoverCardTrigger>
                  <div className="w-7 scale-[1.2]" onClick={toggleMute}>
                    {volumeState === 'mute' ? (
                      <VolumeXIcon />
                    ) : volumeState === 'low' ? (
                      <Volume1Icon />
                    ) : (
                      <Volume2Icon />
                    )}
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-56" align="center" side="top">
                  <Slider
                    max={1}
                    min={0}
                    step={0.1}
                    value={[volume]}
                    className={cs({ 'opacity-50': volumeState === 'mute' })}
                    onValueCommit={updateVolume}
                    onValueChange={(e) => setVolume(e[0])}
                  />
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="p-2 cursor-pointer" onClick={toggleSubtitle}>
              <div className={cs('w-8', { 'opacity-50': !subtitlesVisible })}>
                <ClosedCaptionIcon />
              </div>
            </div>
            <Popover>
              <PopoverTrigger>
                <div className="w-7">
                  <SettingsIcon />
                </div>
              </PopoverTrigger>
              <PopoverContent align="end" side="top">
                <div className="flex gap-3 items-center justify-between pb-3">
                  <div>Subtitle Delay</div>
                  <div className="flex gap-1 items-center">
                    <div className="p-2 cursor-pointer">
                      <div className="w-5" onClick={() => updateSubtitleOffset(-1)}>
                        <MinusIcon />
                      </div>
                    </div>
                    <div className="p-1 rounded opacity-50">{subtitleOffset.toFixed(1)}s</div>
                    <div className="p-2 cursor-pointer">
                      <div className="w-5" onClick={() => updateSubtitleOffset(1)}>
                        <PlusIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="whitespace-nowrap">Playback Speed </div>
                  <Select value={playbackRate} onValueChange={(v) => updatePlaybackRate(v)}>
                    <SelectTrigger className="border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Playback speed</SelectLabel>
                        {PLAYBACK_SPEEDS.map(({ value, name }) => (
                          <SelectItem key={value} value={value}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
            <div className="p-2 cursor-pointer" onClick={togglePip}>
              <div className={cs('', { 'opacity-50': !pipVisible })}>
                <PictureInPicture2 className="scale-[1.2]" />
              </div>
            </div>
            <div className="p-2 pr-2.5 cursor-pointer" onClick={toggleFullScreen}>
              <div className="w-7 ml-0.5">{maximized ? <MinimizeIcon /> : <MaximizeIcon />}</div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ opacity: `${headerVisible ? 1 : 0}` }}
        className={cs(
          'dark',
          'absolute top-0 left-0 bg-gradient-to-b from-black to-transparent z-40 transition-all duration-500',
        )}
      >
        <div
          className="w-screen p-6 px-8 flex gap-4 justify-between"
          style={{ '--max-wasd': 'calc(100vw - 160px)' } as React.CSSProperties}
        >
          <div className="dark  flex items-center gap-2 w-[var(--max-wasd)]">
            <Link to={backTo} className="w-6 scale-[1]">
              <ArrowLeftIcon className=" w-6" />
            </Link>
          </div>
        </div>
        <div className="h-5" />
      </div>
    </div>
  );
});
