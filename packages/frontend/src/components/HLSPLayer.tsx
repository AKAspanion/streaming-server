import Hls from 'hls.js';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

type HLSPlayerProps = {
  hls?: boolean;
  src: string;
  currentTime?: number;
  onUnmount?: () => void;
};

export const HLSPLayer = forwardRef<HTMLVideoElement, HLSPlayerProps>((props, outerRef) => {
  const { src, hls = true, currentTime = 0, onUnmount } = props;
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

        videoRef.play();
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

  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      <div className="bg-black h-screen">
        <video autoPlay controls ref={ref} id="myVideo" />
      </div>
    </div>
  );
});