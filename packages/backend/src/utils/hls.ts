import fs from 'fs';
import { deleteFile, getResourcePath, makeDirectory } from './helper';
import path from 'path';
import { MPEGTS_FILE_NO_SEPERATOR, MPEGTS_TARGET_DURATION } from '@constants/app';

export const generateManifest = (id: string, duration: number) => {
  const manifestFile = `${id}.m3u8`;
  const manifestDir = `_hls/${id}`;
  const pathToManifest = getResourcePath(manifestDir);
  const outputFile = path.join(pathToManifest, manifestFile);

  deleteFile(outputFile);
  makeDirectory(pathToManifest);

  const targetDuration = MPEGTS_TARGET_DURATION;
  const segments: string[] = [];

  const getSegment = (num: number, dur: number) =>
    `#EXTINF:${dur.toFixed(6)},\n${id}${MPEGTS_FILE_NO_SEPERATOR}${num}.ts`;

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
