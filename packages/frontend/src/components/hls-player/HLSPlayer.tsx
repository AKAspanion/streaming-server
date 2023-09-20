import {
  ArrowLeftIcon,
  ArrowPathIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
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
import useHLSPlayer, { HLSPlayerProps } from './useHLSPlayer';

export const HLSPlayer = forwardRef<HTMLVideoElement, HLSPlayerProps>((props, outerRef) => {
  const {
    name,
    nextLink,
    reload = false,
    backTo = '/',
    thumbnailSrc,
    subtitlesText,
    onNext,
    onEnded,
    onReload,
  } = props;

  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useHLSPlayer(props, ref, containerRef, progressRef);

  useImperativeHandle(outerRef, () => ref.current!);

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
            <div className="w-5 mr-4" onClick={onNext}>
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
                <LazyImage
                  src={getThumbnailSrc()}
                  className="w-full max-h-[100px] object-cover drop-shadow"
                />
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
            {subtitlesText && (
              <div className="p-2 cursor-pointer" onClick={toggleSubtitle}>
                <div className={cs('w-8', { 'opacity-50': !subtitlesVisible })}>
                  <ClosedCaptionIcon />
                </div>
              </div>
            )}
            {!maximized ? (
              <Popover>
                <PopoverTrigger>
                  <div className="w-7">
                    <SettingsIcon />
                  </div>
                </PopoverTrigger>
                <PopoverContent align="end" side="top">
                  {subtitlesText && (
                    <div className="flex gap-3 items-center justify-between pb-3">
                      <div>Subtitle Position</div>
                      <div className="flex gap-1 items-center">
                        <div className="p-2 cursor-pointer">
                          <div className="w-5" onClick={() => updateSubtitlePosition(10)}>
                            <MinusIcon />
                          </div>
                        </div>
                        <div className="p-1 rounded opacity-50">{subtitleOffset.toFixed(1)}s</div>
                        <div className="p-2 cursor-pointer">
                          <div className="w-5" onClick={() => updateSubtitlePosition()}>
                            <PlusIcon />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {subtitlesText && (
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
                  )}
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
            ) : null}
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
          className="w-screen flex gap-4 justify-between"
          style={{ '--max-wasd': '100vw' } as React.CSSProperties}
        >
          <div className="dark flex items-center gap-2 w-[var(--max-wasd)]">
            <div className="p-6 px-8">
              <Link to={backTo} className="w-6 scale-[1]">
                <ArrowLeftIcon className="w-6" />
              </Link>
            </div>
            <div className="w-full h-full header-electron" />
            {reload ? (
              <div className="p-6 px-8">
                <div className="w-6 cursor-pointer" onClick={onReload}>
                  <ArrowPathIcon className="w-6" />
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
        <div className="h-5" />
      </div>
    </div>
  );
});
