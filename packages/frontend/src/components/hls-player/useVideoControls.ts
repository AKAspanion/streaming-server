import { useEffect } from 'react';

type UseVideoControlsOptions = {
  toggleFullScreen?: () => void;
  updateSeekTime?: (m: number) => void;
  updateVolume?: (m: number[]) => void;
  togglePlay?: () => void;
};
type UseVideoControls = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options?: UseVideoControlsOptions,
) => void;

const useVideoControls: UseVideoControls = (videoRef, options) => {
  const { updateSeekTime, updateVolume, toggleFullScreen, togglePlay } = options || {};

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const keyDownHandler = (e: KeyboardEvent) => {
      if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        switch (e.key) {
          case 'f':
            toggleFullScreen && toggleFullScreen();
            break;
          case ' ':
            togglePlay && togglePlay();
            e.preventDefault();
            break;
          case 'ArrowRight':
            updateSeekTime && updateSeekTime(1);
            e.preventDefault();
            break;
          case 'ArrowLeft':
            updateSeekTime && updateSeekTime(-1);
            e.preventDefault();
            break;
          case 'ArrowUp':
            updateVolume && updateVolume([video.volume + 0.1 > 1 ? 1 : video.volume + 0.1]);
            e.preventDefault();
            break;
          case 'ArrowDown':
            updateVolume && updateVolume([video.volume - 0.1 < 0 ? 0 : video.volume - 0.1]);
            e.preventDefault();
            break;
        }
      }
    };
    document.addEventListener('keydown', keyDownHandler, false);
    return () => {
      document.removeEventListener('keydown', keyDownHandler, false);
    };
  });
};

export default useVideoControls;
