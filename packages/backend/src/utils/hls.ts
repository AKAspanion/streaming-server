import fs from 'fs';
import { deleteFile, getResourcePath, makeDirectory } from './helper';
import path from 'path';
import {
  SEGMENT_FILE_NO_SEPERATOR,
  SEGMENT_TARGET_DURATION,
  SEGMENT_TEMP_FOLDER,
} from '@constants/hls';

export const generateManifest = (id: string, duration: number) => {
  const manifestFile = `${id}.m3u8`;
  const manifestDir = `${SEGMENT_TEMP_FOLDER}${id}/`;
  const pathToManifest = getResourcePath(manifestDir);
  const outputFile = path.join(pathToManifest, manifestFile);

  deleteFile(outputFile);
  makeDirectory(pathToManifest);

  const targetDuration = SEGMENT_TARGET_DURATION;
  const segments: string[] = [];

  const getSegment = (num: number, dur: number) =>
    `#EXTINF:${dur.toFixed(6)},\n${id}${SEGMENT_FILE_NO_SEPERATOR}${num}.ts`;

  const normalizedDuration = (remainigDuration: number) =>
    remainigDuration < targetDuration ? remainigDuration : targetDuration;

  let index = 0;
  do {
    segments.push(getSegment(index, normalizedDuration(duration)));
    duration -= targetDuration;
    index++;
  } while (duration > 0);

  const manifestfile = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-ALLOW-CACHE:YES
#EXT-X-TARGETDURATION:${targetDuration}
${segments.join('\n')}
#EXT-X-ENDLIST`;

  fs.writeFileSync(outputFile, manifestfile);
};

export const getTotalSegments = (duration: number) => {
  const targetDuration = SEGMENT_TARGET_DURATION;
  let index = 0;
  do {
    duration -= targetDuration;
    index++;
  } while (duration > 0);

  return index - 1;
};

export const extractHLSFileInfo = (filename: string) => {
  const ext = filename.split('.').pop();
  const fileId = filename.split('.')[0];
  let mediaId = '';
  let segment = 0;

  const isTS = ext === 'ts';
  const ism3u8 = ext === 'm3u8';
  const isInvalid = ext !== 'm3u8' && ext !== 'ts';

  if (isTS) {
    mediaId = fileId.split(SEGMENT_FILE_NO_SEPERATOR)[0];
    segment = Number(fileId.split(SEGMENT_FILE_NO_SEPERATOR).pop());
  }

  if (ism3u8) {
    mediaId = fileId;
  }

  return { ext, mediaId, segment, isTS, ism3u8, isInvalid };
};

export const sortHLSFiles = (filenames: string[]) => {
  return filenames.sort();
};
