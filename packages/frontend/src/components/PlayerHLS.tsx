import { ArrowLeftIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import Hls from 'hls.js';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { secToTime } from '@common/utils/date-time';
import { Slider } from './ui/slider';

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

let lazyTimeout: NodeJS.Timeout;
export const HLSPlayer = forwardRef<HTMLVideoElement, HLSPlayerProps>((props, outerRef) => {
  const {
    src,
    showHeader = true,
    hls = true,
    currentTime = 0,
    name,
    backTo = '/',
    onUnmount,
  } = props;
  const [duration, setDuration] = useState('');
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLVideoElement>(null);
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
          });
        });
      } else if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.src = src;
        videoRef.addEventListener('loadedmetadata', () => {
          videoRef.play();
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
          setDuration(secToTime(Math.round(videoRef.duration), true));
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

  const lazyHide = () => {
    clearTimeout(lazyTimeout);
    lazyTimeout = setTimeout(() => {
      setVisible(false);
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
      if (e.clientY < 100) {
        setVisible(true);
        lazyHide();
      } else {
        setVisible(false);
      }
    });
  }, []);

  return (
    <div className="w-full h-full bg-black relative">
      <video
        autoPlay
        ref={ref}
        id="myVideo"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="absolute p-4 bottom-4 left-4 cursor-pointer" onClick={togglePlay}>
        <div className="w-5 ml-0.5">{playing ? <PauseIcon /> : <PlayIcon />}</div>
      </div>
      <div
        style={{ '--hlsplayer-slider-w': 'calc(100% - 40px)' } as React.CSSProperties}
        className="absolute w-[var(--hlsplayer-slider-w)] p-4 bottom-20 left-5 cursor-pointer"
      >
        <Slider />
      </div>
      <div className="text-xs opacity-60 absolute p-2 px-4 bottom-16 left-5">0:0</div>
      <div className="text-xs opacity-60 absolute p-2 px-4 bottom-16 right-5">
        {[duration].filter(Boolean).join(' / ')}
      </div>

      {showHeader && (
        <div
          className="absolute top-0 left-0 bg-gradient-to-b from-black to-transparent  z-40 transition-all duration-500"
          style={{ opacity: `${visible ? 1 : 1}` }}
        >
          <div
            className="w-screen p-4 flex gap-4 justify-between"
            style={{ '--max-wasd': 'calc(100vw - 160px)' } as React.CSSProperties}
          >
            <div className="text-white flex items-center gap-2 w-[var(--max-wasd)]">
              <Link to={backTo} className="w-5">
                <ArrowLeftIcon className="text-white w-5" />
              </Link>
              <div className="text-md overflow-hidden overflow-ellipsis whitespace-nowrap">
                {name}
              </div>
            </div>
          </div>
          <div className="h-5" />
        </div>
      )}
    </div>
  );
});
