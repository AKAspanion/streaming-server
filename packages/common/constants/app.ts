export const TOKEN_HEADER_KEY = 'X-Streaming-Token';

export const WEB_VIDEO_FILES = ['.mp4', '.webm', '.ogg'];
export const ALLOWED_VIDEO_FILES = [
  '.mkv',
  '.mp4',
  '.M4P',
  '.M4V',
  '.avi',
  '.WMV',
  '.FLV',
  '.SWF',
  '.mov',
  '.webm',
  '.mpg',
  '.mp2',
  '.MPEG',
  '.MPE',
  '.MPV',
  '.OGG',
].map((t) => t.toLowerCase());

export const PLAYBACK_SPEEDS = [
  { name: '0.25x', value: '0.25' },
  { name: '0.5x', value: '0.5' },
  { name: '0.75.x', value: '0.75' },
  { name: 'Normal', value: '1' },
  { name: '1.25x', value: '1.25' },
  { name: '1.5x', value: '1.5' },
  // { name: '1.75x', value: '1.75' },
  { name: '2x', value: '2' },
];
