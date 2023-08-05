import { ArrowLeftIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import Hls, { LevelLoadedData } from 'hls.js';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { secToTime } from '@common/utils/date-time';
import { Progress } from './ui/progress';
import { MaximizeIcon, MinimizeIcon } from 'lucide-react';
import { cs } from '@/utils/helpers';
import Spinner from './atoms/spinner/Spinner';

type HLSPlayerProps = {
  hls?: boolean;
  src: string;
  name: string;
  backTo?: string;
  showHeader?: boolean;
  currentTime?: number;
  onUnmount?: () => void;
  children?: React.ReactNode;
};

let lazyHeaderTimeout: NodeJS.Timeout;
let lazyControlsTimeout: NodeJS.Timeout;
// let seekTimeout: NodeJS.Timeout;
export const HLSPlayer = forwardRef<HTMLVideoElement, HLSPlayerProps>((props, outerRef) => {
  const { src, hls = true, currentTime = 0, name, backTo = '/', onUnmount } = props;
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [elapsedDuration, setElapsedDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [playing, setPlaying] = useState(false);
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
          debug: true,
          startPosition: currentTime,
        });

        const hls = hlsObj.current;

        hls.attachMedia(videoRef);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(src);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.play();
            initializeVideo();
          });
        });
        hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          initializeVideo(data);
        });
      } else if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.src = src;
        videoRef.addEventListener('loadedmetadata', () => {
          videoRef.play();
          initializeVideo();
        });
      }
    }
  };

  const initializeVideo = (levelData?: LevelLoadedData) => {
    const videoRef = ref.current;
    if (videoRef) {
      setControlsVisible(true);
      lazyControlsHide();
      const videoDuration = Math.round(videoRef.duration);

      if (!isNaN(videoDuration)) {
        setDuration(videoDuration);
      }

      if (levelData?.details?.totalduration && !isNaN(levelData?.details?.totalduration)) {
        setDuration(levelData?.details?.totalduration);
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
          initializeVideo();
        });
      }
    } catch (e) {
      console.error(e);
    }
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
    if (playing) setPlaying(false);
    setWaiting(true);
  };

  const onPlay = () => {
    if (waiting) setWaiting(false);
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

    const tooltipLeft = Math.round(percentage * totalWidth);

    return tooltipLeft + 20;
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
    document.addEventListener('mousemove', (e) => {
      if (e.clientY < 200) {
        setHeaderVisible(true);
        lazyHeaderHide();
      } else {
        setHeaderVisible(false);
      }

      let offset = 500;

      if (containerRef.current) {
        const { height } = containerRef.current.getBoundingClientRect();
        offset = height / 2;
      }
      if (e.clientY > offset) {
        setControlsVisible(true);
        lazyControlsHide();
      } else {
        setControlsVisible(false);
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-black relative">
      <video
        autoPlay
        ref={ref}
        id="myVideo"
        onClick={togglePlay}
        onPlay={onPlay}
        onPause={onPause}
        onWaiting={onWaiting}
        onProgress={onProgress}
        onTimeUpdate={() => updateElapsedDuration()}
      />
      {waiting && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner large />
        </div>
      )}
      <div
        style={{ opacity: `${controlsVisible ? 1 : 0}` }}
        className={cs(
          'transition-all duration-500',
          'absolute bottom-0 left-0 p-4 bg-gradient-to-b from-transparent to-black w-full',
        )}
        onMouseMove={updateSeekTooltip}
      >
        <div className="line-clamp-1 text-2xl overflow-hidden overflow-ellipsis whitespace-nowrap p-4 drop-shadow">
          {name}
        </div>
        <div
          style={{ '--hlsplayer-slider-w': 'calc(100%)' } as React.CSSProperties}
          className="w-[var(--hlsplayer-slider-w)] px-4 left-5"
        >
          <div className="w-full group cursor-pointer">
            <Progress
              className="w-full"
              max={duration}
              value={progress}
              ref={progressRef}
              onClick={seekVideo}
            />
            <Progress
              className="w-full opacity-10 -translate-y-2 pointer-events-none"
              value={bufferProgress}
              max={100}
            />
            <div
              style={{ left: getTooltipLeft() }}
              className="group-hover:visible invisible absolute text-xs top-24 py-4"
            >
              {secToTime(seekValue, true)}
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-xs drop-shadow pt-2 px-4">{secToTime(elapsedDuration, true)}</div>
          <div className="text-xs drop-shadow pt-2 px-4 ">
            {[duration]
              .filter(Boolean)
              .map((d) => secToTime(Math.round(d), true))
              .join(' / ')}
          </div>
        </div>
        <div className="flex gap-3 justify-between items-center">
          <div className="p-4 pl-2.5 cursor-pointer" onClick={togglePlay}>
            <div className="w-7 ml-0.5">{playing ? <PauseIcon /> : <PlayIcon />}</div>
          </div>
          <div className="p-4 pl-2.5 cursor-pointer" onClick={toggleFullScreen}>
            <div className="w-7 ml-0.5">{maximized ? <MinimizeIcon /> : <MaximizeIcon />}</div>
          </div>
        </div>
      </div>

      <div
        style={{ opacity: `${headerVisible ? 1 : 0}` }}
        className={cs(
          'absolute top-0 left-0 bg-gradient-to-b from-black to-transparent z-40 transition-all duration-500',
        )}
      >
        <div
          className="w-screen p-4 flex gap-4 justify-between"
          style={{ '--max-wasd': 'calc(100vw - 160px)' } as React.CSSProperties}
        >
          <div className="text-white flex items-center gap-2 w-[var(--max-wasd)]">
            <Link to={backTo} className="w-5">
              <ArrowLeftIcon className="text-white w-5" />
            </Link>
          </div>
        </div>
        <div className="h-5" />
      </div>
    </div>
  );
});
